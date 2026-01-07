import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Order from '@/models/Order';
import MenuItem from '@/models/MenuItem';
import { getSessionFromRequest } from '@/lib/auth';

// GET orders (customers: own orders; staff: all orders)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let orders;
    if (session.role === 'staff') {
      // Staff sees ALL orders from ALL customers, sorted by newest first
      orders = await Order.find()
        .populate({
          path: 'customerId',
          select: 'name phone photoUrl',
        })
        .populate({
          path: 'items.menuItemId',
          select: 'name price',
        })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // Customer sees only their own orders, sorted by newest first
      orders = await Order.find({ customerId: session.userId })
        .populate({
          path: 'items.menuItemId',
          select: 'name price',
        })
        .sort({ createdAt: -1 })
        .lean();
    }

    // Ensure we return an array
    return NextResponse.json({ orders: Array.isArray(orders) ? orders : [] });
  } catch (e: any) {
    console.error('Error fetching orders:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST create order (customer only)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { items } = await req.json(); // items: [{ menuItemId, quantity }]
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Items required' }, { status: 400 });
    }

    // Validate and calculate total
    const orderItems = [];
    let totalAmount = 0;
    for (const { menuItemId, quantity } of items) {
      const menuItem = await MenuItem.findById(menuItemId);
      if (!menuItem || !menuItem.isAvailable) {
        return NextResponse.json({ error: `Item ${menuItemId} not available` }, { status: 400 });
      }
      orderItems.push({ menuItemId, quantity, priceAtOrder: menuItem.price });
      totalAmount += menuItem.price * quantity;
    }

    const order = await Order.create({
      customerId: session.userId,
      items: orderItems,
      totalAmount,
      status: 'Placed',
    });

    const populated = await Order.findById(order._id).populate('items.menuItemId', 'name price').lean();
    return NextResponse.json({ order: populated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
