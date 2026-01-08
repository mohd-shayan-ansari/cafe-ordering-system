'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  async function fetchUser() {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (!data.user || data.user.role !== 'customer') {
      router.push('/login');
    } else {
      setUser(data.user);
      setLoading(false);
    }
  }

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 shadow px-4 py-4">
        <h1 className="text-xl font-bold text-white">My Profile</h1>
      </header>

      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white p-6 rounded shadow space-y-4">
          {user.photoUrl && (
            <div className="flex justify-center">
              <img src={user.photoUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-800">Name</label>
            <p className="text-lg">{user.name}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800">Phone</label>
            <p className="text-lg">{user.phone}</p>
          </div>
          <div className="flex gap-4">
            <a
              href="/menu"
              className="flex-1 text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Back to Menu
            </a>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                router.push('/login');
              }}
              className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
