'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scanner } from '@yudiel/react-qr-scanner';

interface Order {
  _id: string;
  status: string;
  totalAmount: number;
  customerId: { name: string; phone: string; photoUrl?: string };
  items: Array<{ menuItemId: { name: string; price: number }; quantity: number }>;
}

export default function StaffDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    fetchOrders();
    fetchMenu();
    const interval = setInterval(() => {
      fetchOrders();
      fetchMenu();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchUser() {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    const data = await res.json();
    if (!data.user || data.user.role !== 'staff') {
      router.push('/staff/login');
    } else {
      setUser(data.user);
      setLoading(false);
    }
  }

  async function fetchOrders() {
    const res = await fetch('/api/orders', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders || []);
    }
  }

  async function fetchMenu() {
    const res = await fetch('/api/menu', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setMenuItems(data.items || []);
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      fetchOrders();
      setSelectedOrder(null);
    } else {
      alert('Failed to update order');
    }
  }

  async function toggleItemAvailability(itemId: string, isAvailable: boolean) {
    const res = await fetch(`/api/menu/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isAvailable }),
    });
    if (res.ok) {
      fetchMenu();
    }
  }

  function handleScan(result: any) {
    const orderId = result?.[0]?.rawValue;
    if (orderId) {
      const order = orders.find((o) => o._id === orderId);
      if (order) {
        setSelectedOrder(order);
        setShowScanner(false);
      } else {
        alert('Order not found');
      }
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 shadow px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Staff Dashboard</h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setShowScanner(!showScanner)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
          >
            {showScanner ? 'Close Scanner' : 'Scan QR'}
          </button>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
              router.push('/staff/login');
            }}
            className="text-white text-sm hover:bg-red-600 bg-red-500 px-3 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </header>

      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Scan Order QR Code</h2>
            <Scanner onScan={handleScan} />
            <button
              onClick={() => setShowScanner(false)}
              className="mt-4 w-full bg-gray-200 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-lg w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="space-y-2">
              <p><strong>Order ID:</strong> {selectedOrder._id}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Total:</strong> ₹{selectedOrder.totalAmount}</p>
              <div>
                <strong>Customer:</strong>
                <div className="flex items-center gap-2 mt-1">
                  {selectedOrder.customerId.photoUrl && (
                    <img
                      src={selectedOrder.customerId.photoUrl}
                      alt="Customer"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p>{selectedOrder.customerId.name}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customerId.phone}</p>
                  </div>
                </div>
              </div>
              <div>
                <strong>Items:</strong>
                <ul className="ml-4 list-disc">
                  {selectedOrder.items.map((item, idx) => (
                    <li key={idx}>
                      {item.quantity}x {item.menuItemId.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              {selectedOrder.status === 'Placed' && (
                <button
                  onClick={() => updateOrderStatus(selectedOrder._id, 'PaymentReceived')}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Mark Payment Received
                </button>
              )}
              {selectedOrder.status === 'PaymentReceived' && (
                <button
                  onClick={() => updateOrderStatus(selectedOrder._id, 'Preparing')}
                  className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
                >
                  Start Preparing
                </button>
              )}
              {selectedOrder.status === 'Preparing' && (
                <button
                  onClick={() => updateOrderStatus(selectedOrder._id, 'Ready')}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Mark Ready
                </button>
              )}
              {selectedOrder.status === 'Ready' && (
                <button
                  onClick={() => updateOrderStatus(selectedOrder._id, 'HandedOver')}
                  className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                >
                  Hand Over
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-gray-200 py-2 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Orders</h2>
          <div className="space-y-2">
            {orders.filter((o) => o.status !== 'HandedOver').length === 0 && (
              <p className="text-sm text-gray-600">No active orders</p>
            )}
            {orders
              .filter((o) => o.status !== 'HandedOver')
              .map((order) => (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">Order #{order._id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">{order.customerId.name}</p>
                      <p className="text-sm text-gray-600">₹{order.totalAmount}</p>
                    </div>
                    <div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'Placed'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'PaymentReceived'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'Preparing'
                            ? 'bg-orange-100 text-orange-800'
                            : order.status === 'Ready'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Menu Management</h2>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <div key={item._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">₹{item.price}</p>
                </div>
                <button
                  onClick={() => toggleItemAvailability(item._id, !item.isAvailable)}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    item.isAvailable
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
