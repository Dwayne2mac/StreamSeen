import { Button } from "@/components/ui/button";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 p-4">
      <div className="max-w-md w-full">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">StreamSeen</h1>
          <p className="text-gray-400 mt-2">Discover movies and shows with friends</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">Welcome Back</h2>
          
          {/* Auth Button */}
          <div className="space-y-4">
            <Button 
              onClick={handleLogin}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Continue with Replit
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-4">Join thousands discovering their next favorite watch</p>
          <div className="flex justify-center space-x-6 text-xs text-gray-500">
            <span>🎬 AI Recommendations</span>
            <span>👥 Friend Watchlists</span>
            <span>📺 Streaming Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
