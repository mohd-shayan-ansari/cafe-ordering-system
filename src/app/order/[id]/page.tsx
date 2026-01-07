'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode';

interface Order {
  _id: string;
  status: string;
  totalAmount: number;
  items: Array<{ menuItemId: { name: string; price: number }; quantity: number }>;
}

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [orderId]);

  async function fetchOrder() {
    const res = await fetch(`/api/orders/${orderId}`, { credentials: 'include' });
    if (!res.ok) {
      router.push('/menu');
      return;
    }
    const data = await res.json();
    setOrder(data.order);
    setLoading(false);

    // Generate QR with order ID
    const qr = await QRCode.toDataURL(orderId);
    setQrCode(qr);
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (!order) return <div className="p-4">Order not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Order Placed!</h1>
        <div className="mb-4">
          <p className="text-sm text-gray-600">Order ID: {order._id}</p>
          <p className="text-sm text-gray-600">Status: <span className="font-semibold">{order.status}</span></p>
          <p className="text-sm text-gray-600">Total: ₹{order.totalAmount}</p>
        </div>

        <div className="border-t border-b py-4 my-4">
          <h3 className="font-semibold mb-2">Items:</h3>
          <ul className="space-y-1 text-sm">
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.quantity}x {item.menuItemId.name} - ₹{item.menuItemId.price * item.quantity}
              </li>
            ))}
          </ul>
        </div>

        {qrCode && (
          <div className="text-center">
            <p className="text-sm mb-2 font-medium">Show this QR to staff:</p>
            <img src={qrCode} alt="Order QR" className="mx-auto border p-2 rounded" />
          </div>
        )}

        <div className="mt-6 space-y-2">
          <a
            href="/menu"
            className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Back to Menu
          </a>
          <a
            href="/orders"
            className="block w-full text-center bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
          >
            View All Orders
          </a>
        </div>
      </div>
    </div>
  );
}
