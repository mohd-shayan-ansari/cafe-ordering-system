'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, isStaff: false }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Login failed');
      return;
    }

    router.push('/menu');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border-2 border-orange-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-1">KBS Foods</h1>
          <p className="text-gray-600 font-medium">Customer Login</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">📱 Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">🔒 Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              placeholder="Enter your password"
            />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 font-semibold transition transform hover:scale-105 shadow-md"
          >
            {loading ? 'Logging in...' : '🚀 Login'}
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
        <p className="text-sm text-center mt-2">
          <a href="/staff/login" className="text-gray-600 hover:underline">
            Staff Login
          </a>
        </p>
      </div>
    </div>
  );
}
