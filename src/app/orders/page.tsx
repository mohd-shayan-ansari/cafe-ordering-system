'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Order {
  _id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  async function fetchOrders() {
    const res = await fetch('/api/orders', { credentials: 'include' });
    if (!res.ok) {
      router.push('/login');
      return;
    }
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 shadow px-4 py-4">
        <h1 className="text-xl font-bold text-white">My Orders</h1>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {orders.length === 0 && <p>No orders yet</p>}
        {orders.map((order) => (
          <div key={order._id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">Order #{order._id.slice(-6)}</p>
                <p className="text-sm text-gray-600">Status: {order.status}</p>
                <p className="text-sm text-gray-600">Total: ₹{order.totalAmount}</p>
              </div>
              <a
                href={`/order/${order._id}`}
                className="text-blue-600 text-sm hover:underline"
              >
                View Details
              </a>
            </div>
          </div>
        ))}
        <a href="/menu" className="block text-center text-blue-600 hover:underline">
          Back to Menu
        </a>
      </div>
    </div>
  );
}
