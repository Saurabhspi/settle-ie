import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-900">Settle.ie</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            👋 Welcome, {user?.full_name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-4">🇮🇪</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            You're all set, {user?.full_name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-500 text-sm">
            Your personalised Ireland relocation roadmap is being prepared.
          </p>
          <div className="mt-8 bg-emerald-50 rounded-xl p-6">
            <p className="text-emerald-700 text-sm font-medium">
              ✅ Account created successfully
            </p>
            <p className="text-emerald-600 text-sm mt-1">
              Week 2 will add your full personalised roadmap here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}