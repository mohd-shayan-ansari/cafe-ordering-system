import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import { getSessionFromRequest } from '@/lib/auth';

// PATCH update menu item availability (staff only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'staff') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { isAvailable } = await req.json();

    const item = await MenuItem.findByIdAndUpdate(id, { isAvailable }, { new: true });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
