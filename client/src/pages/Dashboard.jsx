import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/auth';

const categoryColors = {
  identity: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  immigration: { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
  finance: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  health: { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' },
  transport: { bg: 'bg-cyan-50', text: 'text-cyan-600', dot: 'bg-cyan-500' },
  family: { bg: 'bg-pink-50', text: 'text-pink-600', dot: 'bg-pink-500' },
};

const statusConfig = {
  pending: { label: 'Pending', bg: 'bg-gray-100', text: 'text-gray-600' },
  in_progress: { label: 'In Progress', bg: 'bg-amber-100', text: 'text-amber-700' },
  done: { label: 'Done', bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [steps, setSteps] = useState([]);
  const [progress, setProgress] = useState({
    total: 0, completed: 0, percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  // Fetch roadmap steps and progress on page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stepsRes, progressRes] = await Promise.all([
          API.get('/roadmap'),
          API.get('/roadmap/progress'),
        ]);
        setSteps(stepsRes.data);
        setProgress(progressRes.data);
      } catch (err) {
        console.error('Failed to fetch roadmap', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update a step's status when user changes it
  const handleStatusChange = async (stepId, newStatus) => {
    try {
      await API.patch(`/roadmap/${stepId}`, { status: newStatus });

      // Update steps in local state without refetching
      setSteps(prev =>
        prev.map(s => s.id === stepId ? { ...s, status: newStatus } : s)
      );

      // Recalculate progress locally
      const updated = steps.map(s =>
        s.id === stepId ? { ...s, status: newStatus } : s
      );
      const completed = updated.filter(s => s.status === 'done').length;
      const total = updated.length;
      const percentage = total > 0
        ? Math.round((completed / total) * 100)
        : 0;
      setProgress({ total, completed, percentage });

    } catch (err) {
      console.error('Failed to update step', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get unique categories from steps for filter buttons
  const categories = ['all', ...new Set(steps.map(s => s.category))];

  // Filter steps by selected category
  const filteredSteps = activeCategory === 'all'
    ? steps
    : steps.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-gray-900">Settle.ie</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/assistant')}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Ask Fáilte
          </button>
          <span className="text-sm text-gray-500">
            👋 {user?.full_name}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:text-red-600 font-medium"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Progress card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Your Ireland Roadmap
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {progress.completed} of {progress.total} steps completed
              </p>
            </div>
            <span className="text-2xl font-bold text-emerald-600">
              {progress.percentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>

          {/* Completion message */}
          {progress.percentage === 100 && (
            <div className="mt-4 bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl text-center font-medium">
              🎉 Congratulations! You have completed your Irish relocation checklist!
            </div>
          )}
        </div>

        {/* Category filter buttons */}
        {!loading && steps.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-4 py-2 rounded-full font-medium capitalize transition-all ${activeCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Loading your roadmap...
          </div>
        )}

        {/* Empty state */}
        {!loading && steps.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-gray-500 text-sm mb-4">
              You have not completed onboarding yet.
            </p>
            <button
              onClick={() => navigate('/onboarding')}
              className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700"
            >
              Complete onboarding
            </button>
          </div>
        )}

        {/* Steps list */}
        {!loading && filteredSteps.map(step => {
          const cat = categoryColors[step.category] || categoryColors.identity;
          const status = statusConfig[step.status];

          return (
            <div
              key={step.id}
              className={`bg-white rounded-2xl border border-gray-100 p-5 mb-3 transition-opacity ${step.status === 'done' ? 'opacity-60' : 'opacity-100'
                }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">

                  {/* Step number */}
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-gray-500">
                      {step.order_index}
                    </span>
                  </div>

                  <div className="flex-1">
                    {/* Category badge */}
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium mb-2 ${cat.bg} ${cat.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                      {step.category}
                    </span>

                    {/* Title */}
                    <h3 className={`text-sm font-medium text-gray-800 mb-1 ${step.status === 'done' ? 'line-through text-gray-400' : ''
                      }`}>
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Due date warning */}
                    {step.due_date && step.status !== 'done' && (
                      <p className="text-xs text-red-500 mt-2 font-medium">
                        ⚠️ Due by {new Date(step.due_date).toLocaleDateString('en-IE')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status dropdown */}
                <select
                  value={step.status}
                  onChange={e => handleStatusChange(step.id, e.target.value)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium border-0 cursor-pointer flex-shrink-0 ${status.bg} ${status.text}`}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}