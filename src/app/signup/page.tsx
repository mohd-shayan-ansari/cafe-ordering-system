'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name, password, photoUrl: photoUrl || undefined }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Signup failed');
      return;
    }

    router.push('/menu');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border-2 border-green-200">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-1">KBS Foods</h1>
          <p className="text-gray-600 font-medium">Create Your Account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">📱 Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">👤 Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">🔒 Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
              placeholder="Create a password"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">📷 Profile Photo URL (Optional)</label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
            />
          </div>
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 font-semibold transition transform hover:scale-105 shadow-md"
          >
            {loading ? 'Creating Account...' : '✨ Sign Up'}
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
