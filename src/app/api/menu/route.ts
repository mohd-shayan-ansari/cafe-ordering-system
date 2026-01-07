import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import { getSessionFromRequest } from '@/lib/auth';

// GET all menu items
export async function GET() {
  try {
    await connectDB();
    const items = await MenuItem.find().lean();
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST create menu item (staff only)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'staff') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, description, price, imageUrl } = await req.json();
    if (!name || !price) {
      return NextResponse.json({ error: 'Name and price required' }, { status: 400 });
    }

    const item = await MenuItem.create({ name, description, price, imageUrl });
    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
