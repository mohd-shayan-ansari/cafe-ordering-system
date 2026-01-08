import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { phone, name, password, photoUrl } = await req.json();

    if (!phone || !name || !password) {
      return NextResponse.json({ error: 'Phone, name, and password are required' }, { status: 400 });
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      role: 'customer',
      phone,
      name,
      photoUrl: photoUrl || undefined,
      passwordHash,
    });

    const token = signToken({ userId: user._id.toString(), role: user.role });
    const res = NextResponse.json({
      user: {
        id: user._id,
        role: user.role,
        phone: user.phone,
        name: user.name,
        photoUrl: user.photoUrl,
      },
    });
    res.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
