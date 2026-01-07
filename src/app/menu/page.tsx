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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 shadow px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">Cafe Menu</h1>
        <div className="flex gap-4 items-center">
          <span className="text-sm text-white">Hi, {user?.name}</span>
          <a href="/profile" className="text-white text-sm hover:underline border border-white px-3 py-1 rounded">
            Profile
          </a>
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
              router.push('/login');
            }}
            className="text-white text-sm hover:bg-red-600 bg-red-500 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Available Items</h2>
          {items.filter((i) => i.isAvailable).length === 0 && <p>No items available</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            {items
              .filter((i) => i.isAvailable)
              .map((item) => (
                <div key={item._id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
                  <div className="w-full h-40 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🍽️</span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <p className="text-xl font-bold mt-2 text-green-600">₹{item.price}</p>
                  <button
                    onClick={() => addToCart(item)}
                    className="mt-2 w-full bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow h-fit sticky top-4">
          <h2 className="text-lg font-semibold mb-4">Cart</h2>
          {cart.length === 0 && <p className="text-sm text-gray-600">Cart is empty</p>}
          <div className="space-y-2">
            {cart.map((c) => (
              <div key={c.menuItemId} className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-gray-600">₹{c.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(c.menuItemId, -1)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="w-8 text-center">{c.quantity}</span>
                  <button
                    onClick={() => updateQuantity(c.menuItemId, 1)}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
          {cart.length > 0 && (
            <>
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
              <button
                onClick={placeOrder}
                className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Place Order
              </button>
            </>
          )}
          <div className="mt-4 pt-4 border-t">
            <a href="/orders" className="text-blue-600 text-sm hover:underline">
              View My Orders
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
