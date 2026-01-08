import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { getSessionFromRequest } from '@/lib/auth';

// GET all orders (staff only)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'staff') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const orders = await Order.find()
      .populate({ path: 'customerId', select: 'name phone photoUrl' })
      .populate({ path: 'items.menuItemId', select: 'name price' })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
