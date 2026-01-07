'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
}

interface CartItem {
  menuItemId: string;
  quantity: number;
  name: string;
  price: number;
}

export default function MenuPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchUser();
    fetchMenu();
  }, []);

  async function fetchUser() {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    const data = await res.json();
    if (!data.user || data.user.role !== 'customer') {
      router.push('/login');
    } else {
      setUser(data.user);
    }
  }

  async function fetchMenu() {
    const res = await fetch('/api/menu');
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  function addToCart(item: MenuItem) {
    const existing = cart.find((c) => c.menuItemId === item._id);
    if (existing) {
      setCart(cart.map((c) => (c.menuItemId === item._id ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      setCart([...cart, { menuItemId: item._id, quantity: 1, name: item.name, price: item.price }]);
    }
  }

  function updateQuantity(menuItemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => (c.menuItemId === menuItemId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  }

  async function placeOrder() {
    if (cart.length === 0) return;
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        items: cart.map((c) => ({ menuItemId: c.menuItemId, quantity: c.quantity })),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push(`/order/${data.order._id}`);
    } else {
      alert(data.error || 'Failed to place order');
    }
  }

  const totalAmount = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <header className="bg-gradient-to-r from-orange-600 to-red-600 shadow-lg px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">KBS Foods</h1>
          <p className="text-xs text-orange-100">Menu</p>
        </div>
        <div className="flex gap-3 items-center">
          <span className="text-sm text-white font-medium">👋 Hi, {user?.name}</span>
          <a href="/profile" className="text-white text-sm hover:bg-orange-700 border-2 border-white px-3 py-2 rounded-xl font-semibold transition">
            Profile
          </a>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
              router.push('/login');
            }}
            className="text-white text-sm hover:bg-red-700 bg-red-600 px-3 py-2 rounded-xl font-semibold transition shadow-md"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">🍽️ Available Items</h2>
          {items.filter((i) => i.isAvailable).length === 0 && (
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <p className="text-gray-500">No items available at the moment</p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            {items
              .filter((i) => i.isAvailable)
              .map((item) => (
                <div key={item._id} className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition transform hover:scale-105 border-2 border-orange-100">
                  <div className="w-full h-40 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">🍽️</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                  {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                  <p className="text-xl font-bold mt-2 text-orange-600">₹{item.price}</p>
                  <button
                    onClick={() => addToCart(item)}
                    className="mt-3 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-xl hover:from-orange-600 hover:to-red-600 font-semibold transition shadow-md"
                  >
                    ➕ Add to Cart
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl h-fit sticky top-4 border-2 border-orange-200">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">🛒 Your Cart</h2>
          {cart.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">Add items to get started</p>
            </div>
          )}
          <div className="space-y-3">
            {cart.map((c) => (
              <div key={c.menuItemId} className="flex justify-between items-center bg-orange-50 p-3 rounded-xl">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-600">₹{c.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(c.menuItemId, -1)}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold transition shadow-sm"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold">{c.quantity}</span>
                  <button
                    onClick={() => updateQuantity(c.menuItemId, 1)}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold transition shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          {cart.length > 0 && (
            <>
              <div className="border-t-2 border-orange-200 mt-4 pt-4">
                <div className="flex justify-between font-bold text-lg text-gray-800">
                  <span>Total:</span>
                  <span className="text-orange-600">₹{totalAmount}</span>
                </div>
              </div>
              <button
                onClick={placeOrder}
                className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 font-bold transition shadow-lg text-lg"
              >
                🚀 Place Order
              </button>
            </>
          )}
          <div className="mt-4 pt-4 border-t-2 border-orange-200">
            <a href="/orders" className="text-orange-600 text-sm hover:underline font-semibold flex items-center gap-1">
              📋 View My Orders →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
