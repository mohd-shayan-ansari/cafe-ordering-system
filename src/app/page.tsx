export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border-2 border-orange-200">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mb-2">KBS Foods</h1>
          <p className="text-lg font-medium text-gray-700">Delicious Food, Quick Service</p>
        </div>
        <p className="text-center text-gray-600 mb-8">Order your favorite food with ease</p>
        
        <div className="space-y-4">
          <a
            href="/login"
            className="block w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-3 rounded-xl hover:from-orange-600 hover:to-red-600 font-semibold transition transform hover:scale-105 shadow-md"
          >
            🍕 Customer Login
          </a>
          <a
            href="/signup"
            className="block w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 font-semibold transition transform hover:scale-105 shadow-md"
          >
            ✨ Create Account
          </a>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-medium">Staff Access</span>
            </div>
          </div>
          <a
            href="/staff/login"
            className="block w-full bg-gradient-to-r from-gray-700 to-gray-900 text-white text-center py-3 rounded-xl hover:from-gray-800 hover:to-black font-semibold transition transform hover:scale-105 shadow-md"
          >
            👨‍🍳 Staff Login
          </a>
        </div>
      </div>
    </div>
  );
}
