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

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export default function StaffDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: 0, imageUrl: '' });

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

  async function addNewItem() {
    if (!newItem.name || newItem.price <= 0) {
      alert('Please fill in name and price');
      return;
    }
    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newItem),
    });
    if (res.ok) {
      setNewItem({ name: '', description: '', price: 0, imageUrl: '' });
      setShowAddItemForm(false);
      fetchMenu();
    } else {
      alert('Failed to add item');
    }
  }

  async function updateMenuItem() {
    if (!editingItem) return;
    const res = await fetch(`/api/menu/${editingItem._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: editingItem.name,
        description: editingItem.description,
        price: editingItem.price,
        imageUrl: editingItem.imageUrl,
      }),
    });
    if (res.ok) {
      setEditingItem(null);
      fetchMenu();
    } else {
      alert('Failed to update item');
    }
  }

  async function deleteMenuItem(itemId: string) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const res = await fetch(`/api/menu/${itemId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.ok) {
      fetchMenu();
    } else {
      alert('Failed to delete item');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-gradient-to-r from-orange-600 to-red-600 shadow-lg px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">KBS Foods</h1>
          <p className="text-xs text-orange-100">Staff Dashboard</p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setShowScanner(!showScanner)}
            className="bg-white text-orange-600 px-4 py-2 rounded-xl hover:bg-orange-50 font-semibold transition shadow-md"
          >
            {showScanner ? '✕ Close' : '📷 Scan QR'}
          </button>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
              router.push('/staff/login');
            }}
            className="text-white text-sm hover:bg-red-700 bg-red-600 px-4 py-2 rounded-xl font-semibold transition shadow-md"
          >
            Logout
          </button>
        </div>
      </header>

      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-800">📷 Scan Order QR Code</h2>
            <Scanner onScan={handleScan} />
            <button
              onClick={() => setShowScanner(false)}
              className="mt-4 w-full bg-gray-200 py-3 rounded-xl hover:bg-gray-300 font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">➕ Add New Menu Item</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">🍽️ Item Name *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="e.g., Margherita Pizza"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">📝 Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="Brief description"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">💰 Price (₹) *</label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">🖼️ Image URL</label>
                <input
                  type="url"
                  value={newItem.imageUrl}
                  onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={addNewItem}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 font-semibold transition shadow-md"
                >
                  ✓ Add Item
                </button>
                <button
                  onClick={() => {
                    setShowAddItemForm(false);
                    setNewItem({ name: '', description: '', price: 0, imageUrl: '' });
                  }}
                  className="flex-1 bg-gray-200 py-3 rounded-xl hover:bg-gray-300 font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">✏️ Edit Menu Item</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">🍽️ Item Name *</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">📝 Description</label>
                <textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">💰 Price (₹) *</label>
                <input
                  type="number"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">🖼️ Image URL</label>
                <input
                  type="url"
                  value={editingItem.imageUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={updateMenuItem}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 font-semibold transition shadow-md"
                >
                  ✓ Save Changes
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 bg-gray-200 py-3 rounded-xl hover:bg-gray-300 font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
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
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">📋 Active Orders</h2>
          <div className="space-y-3">
            {orders.filter((o) => o.status !== 'HandedOver').length === 0 && (
              <div className="bg-white p-6 rounded-xl shadow-md text-center">
                <p className="text-gray-500">No active orders</p>
              </div>
            )}
            {orders
              .filter((o) => o.status !== 'HandedOver')
              .map((order) => (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white p-4 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition transform hover:scale-102 border-2 border-transparent hover:border-orange-200"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold text-gray-800">Order #{order._id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">👤 {order.customerId.name}</p>
                      <p className="text-sm font-semibold text-orange-600">₹{order.totalAmount}</p>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">🍽️ Menu Management</h2>
            <button
              onClick={() => setShowAddItemForm(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-600 font-semibold transition shadow-md text-sm"
            >
              ➕ Add Item
            </button>
          </div>
          <div className="space-y-3">
            {menuItems.map((item) => (
              <div key={item._id} className="bg-white p-4 rounded-xl shadow-md border-2 border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{item.name}</p>
                    {item.description && <p className="text-xs text-gray-500 mt-1">{item.description}</p>}
                    <p className="text-sm font-semibold text-orange-600 mt-1">₹{item.price}</p>
                  </div>
                  <div className="flex gap-2 flex-col">
                    <button
                      onClick={() => toggleItemAvailability(item._id, !item.isAvailable)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition shadow-sm ${
                        item.isAvailable
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {item.isAvailable ? '✓ Available' : '✕ Unavailable'}
                    </button>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200 transition shadow-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteMenuItem(item._id)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200 transition shadow-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
