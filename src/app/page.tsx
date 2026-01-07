export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">Welcome to Cafe</h1>
        <p className="text-center text-gray-600 mb-8">Order your favorite food with ease</p>
        
        <div className="space-y-4">
          <a
            href="/login"
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 font-medium transition"
          >
            Customer Login
          </a>
          <a
            href="/signup"
            className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 font-medium transition"
          >
            Customer Signup
          </a>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Staff Access</span>
            </div>
          </div>
          <a
            href="/staff/login"
            className="block w-full bg-gray-800 text-white text-center py-3 rounded-lg hover:bg-gray-900 font-medium transition"
          >
            Staff Login
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            Staff credentials: testervip / checkkro
          </p>
        </div>
      </div>
    </div>
  );
}
