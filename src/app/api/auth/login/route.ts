import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { verifyPassword, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { phone, password, isStaff } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 });
    }

    // Staff login: check env vars
    if (isStaff) {
      const { STAFF_USERNAME, STAFF_PASSWORD } = process.env;
      if (phone === STAFF_USERNAME && password === STAFF_PASSWORD) {
        // Create or find staff user
        let staff = await User.findOne({ phone, role: 'staff' });
        if (!staff) {
          const bcrypt = require('bcryptjs');
          const hash = await bcrypt.hash(password, 10);
          staff = await User.create({ role: 'staff', phone, name: 'Staff', passwordHash: hash });
        }
        await setSessionCookie(staff._id.toString(), staff.role);
        return NextResponse.json({
          user: { id: staff._id, role: staff.role, phone: staff.phone, name: staff.name },
        });
      } else {
        return NextResponse.json({ error: 'Invalid staff credentials' }, { status: 401 });
      }
    }

    // Customer login: check DB
    const user = await User.findOne({ phone, role: 'customer' });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    await setSessionCookie(user._id.toString(), user.role);

    return NextResponse.json({
      user: {
        id: user._id,
        role: user.role,
        phone: user.phone,
        name: user.name,
        photoUrl: user.photoUrl,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
