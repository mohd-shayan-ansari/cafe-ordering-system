import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import { getSessionFromRequest } from '@/lib/auth';

// PATCH update menu item (staff only) - can update availability or full item details
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'staff') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // Allow updating any fields: name, description, price, imageUrl, isAvailable
    const item = await MenuItem.findByIdAndUpdate(id, body, { new: true });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE menu item (staff only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'staff') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const item = await MenuItem.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item deleted' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
