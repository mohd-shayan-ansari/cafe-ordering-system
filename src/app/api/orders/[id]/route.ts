import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import { getSessionFromRequest } from '@/lib/auth';

// GET single order by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const order = await Order.findById(id).populate('customerId', 'name phone photoUrl').populate('items.menuItemId', 'name price').lean();
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Customers can only see their own orders
    if (session.role === 'customer' && order.customerId._id.toString() !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH update order status (staff only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'staff') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await req.json();

    console.log(`[Orders API] Staff updating order ${id} to status: ${status}`);

    // First update the status
    await Order.findByIdAndUpdate(id, { status }, { new: true });

    // Then fetch with proper population (populate must be called before lean)
    const order = await Order.findById(id)
      .populate('customerId', 'name phone photoUrl')
      .populate('items.menuItemId', 'name price')
      .lean();

    if (!order) {
      console.error(`[Orders API] Order ${id} not found after update`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log(`[Orders API] Order ${id} successfully updated to status: ${order.status}`);
    return NextResponse.json({ order });
  } catch (e: any) {
    console.error(`[Orders API] Error updating order: ${e.message}`);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
