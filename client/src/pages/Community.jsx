import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import API from '../api/auth';

const CATEGORIES = [
  { value: 'all', label: 'All tips', icon: '✨' },
  { value: 'pps_number', label: 'PPS Number', icon: '🪪' },
  { value: 'bank_account', label: 'Bank Account', icon: '🏦' },
  { value: 'irp_card', label: 'IRP Card', icon: '🟦' },
  { value: 'housing', label: 'Housing', icon: '🏠' },
  { value: 'tax', label: 'Tax', icon: '💰' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'transport', label: 'Transport', icon: '🚌' },
  { value: 'general', label: 'General', icon: '💬' },
];

const categoryColors = {
  pps_number: { bg: '#E6F1FB', text: '#185FA5' },
  bank_account: { bg: '#FAEEDA', text: '#854F0B' },
  irp_card: { bg: '#EEEDFE', text: '#534AB7' },
  housing: { bg: '#FEF3C7', text: '#92400E' },
  tax: { bg: '#FCE7F3', text: '#9D174D' },
  health: { bg: '#FCEBEB', text: '#A32D2D' },
  transport: { bg: '#E1F5EE', text: '#0F6E56' },
  general: { bg: '#F3F4F6', text: '#374151' },
};

export default function Community() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'general',
  });

  // Fetch tips
  useEffect(() => {
    fetchTips();
  }, [activeCategory]);

  const fetchTips = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/community?category=${activeCategory}`);
      setTips(res.data);
    } catch (err) {
      console.error('Failed to fetch tips', err);
    } finally {
      setLoading(false);
    }
  };

  // Submit new tip
  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await API.post('/community', form);
      setTips(prev => [res.data, ...prev]);
      setForm({ title: '', content: '', category: 'general' });
      setShowForm(false);
      setSuccess('Your tip was shared successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to share tip');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle like
  const handleLike = async (tipId) => {
    try {
      const res = await API.post(`/community/${tipId}/like`);
      setTips(prev => prev.map(tip => {
        if (tip.id !== tipId) return tip;
        return {
          ...tip,
          likes: res.data.liked ? tip.likes + 1 : tip.likes - 1,
          has_liked: res.data.liked,
        };
      }));
    } catch (err) {
      console.error('Like failed', err);
    }
  };

  // Delete tip
  const handleDelete = async (tipId) => {
    if (!window.confirm('Delete this tip?')) return;
    try {
      await API.delete(`/community/${tipId}`);
      setTips(prev => prev.filter(t => t.id !== tipId));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen" style={{ background: '#F7F3EB' }}>

      {/* Navbar */}
      <nav style={{ background: '#F7F3EB', borderBottom: '0.5px solid #DDD8CC' }}
        className="px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 style={{ color: '#1A3D2B', fontSize: '18px', fontWeight: 500, margin: 0 }}>
          Settle.ie
        </h1>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')}
            style={{
              color: '#0F6E56', fontSize: '13px', background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: 500
            }}>
            Roadmap
          </button>
          <button onClick={() => navigate('/assistant')}
            style={{
              color: '#5A6B5E', fontSize: '13px', background: 'none',
              border: 'none', cursor: 'pointer'
            }}>
            Ask Fáilte
          </button>
          <button onClick={() => navigate('/documents')}
            style={{
              color: '#5A6B5E', fontSize: '13px', background: 'none',
              border: 'none', cursor: 'pointer'
            }}>
            Documents
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="flex justify-between items-start">
            <div>
              <h2 style={{ color: '#1A3D2B', fontSize: '22px', fontWeight: 500, margin: 0 }}>
                Community Tips
              </h2>
              <p style={{ color: '#7A8C7E', fontSize: '13px', margin: '4px 0 0' }}>
                Real advice from people who've been through it
              </p>
            </div>
            <motion.button
              onClick={() => setShowForm(!showForm)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: '#1A3D2B', color: '#F7F3EB', fontSize: '13px',
                padding: '8px 18px', borderRadius: '10px', border: 'none',
                fontWeight: 500, cursor: 'pointer',
              }}
            >
              {showForm ? 'Cancel' : '+ Share a tip'}
            </motion.button>
          </div>
        </motion.div>

        {/* Success message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: '#E1F5EE', color: '#0F6E56', fontSize: '13px',
                padding: '12px 16px', borderRadius: '10px', marginBottom: '16px'
              }}
            >
              ✅ {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share tip form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden', marginBottom: '20px' }}
            >
              <div style={{
                background: '#fff', border: '0.5px solid #DDD8CC',
                borderRadius: '16px', padding: '20px'
              }}>
                <h3 style={{
                  color: '#1A3D2B', fontSize: '15px', fontWeight: 500,
                  margin: '0 0 16px'
                }}>
                  Share your experience
                </h3>

                {error && (
                  <div style={{
                    background: '#FEF2F2', color: '#991B1B', fontSize: '12px',
                    padding: '10px 14px', borderRadius: '8px', marginBottom: '12px'
                  }}>
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label style={{
                      fontSize: '12px', color: '#5A6B5E',
                      display: 'block', marginBottom: '5px'
                    }}>
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      style={{
                        width: '100%', border: '0.5px solid #DDD8CC',
                        borderRadius: '8px', padding: '9px 12px', fontSize: '13px',
                        background: '#FDFBF7', outline: 'none'
                      }}
                    >
                      {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{
                      fontSize: '12px', color: '#5A6B5E',
                      display: 'block', marginBottom: '5px'
                    }}>
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. My BOI account took 3 weeks — here's what helped"
                      value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      style={{
                        width: '100%', border: '0.5px solid #DDD8CC',
                        borderRadius: '8px', padding: '9px 12px', fontSize: '13px',
                        background: '#FDFBF7', outline: 'none', boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      fontSize: '12px', color: '#5A6B5E',
                      display: 'block', marginBottom: '5px'
                    }}>
                      Your tip
                    </label>
                    <textarea
                      placeholder="Share your experience — what worked, what to avoid, what to bring..."
                      value={form.content}
                      onChange={e => setForm({ ...form, content: e.target.value })}
                      rows={4}
                      style={{
                        width: '100%', border: '0.5px solid #DDD8CC',
                        borderRadius: '8px', padding: '9px 12px', fontSize: '13px',
                        background: '#FDFBF7', outline: 'none', resize: 'vertical',
                        boxSizing: 'border-box', fontFamily: 'inherit'
                      }}
                    />
                    <p style={{
                      fontSize: '11px', color: '#B8C4BC',
                      margin: '4px 0 0', textAlign: 'right'
                    }}>
                      {form.content.length}/2000
                    </p>
                  </div>

                  <motion.button
                    onClick={handleSubmit}
                    disabled={submitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%', background: '#1A3D2B', color: '#F7F3EB',
                      padding: '10px', borderRadius: '10px', border: 'none',
                      fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                      opacity: submitting ? 0.6 : 1
                    }}
                  >
                    {submitting ? 'Sharing...' : 'Share tip'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                fontSize: '12px', padding: '6px 14px', borderRadius: '20px',
                border: '0.5px solid',
                borderColor: activeCategory === cat.value ? '#1A3D2B' : '#DDD8CC',
                background: activeCategory === cat.value ? '#1A3D2B' : '#fff',
                color: activeCategory === cat.value ? '#F7F3EB' : '#5A6B5E',
                cursor: 'pointer', fontWeight: activeCategory === cat.value ? 500 : 400,
              }}
            >
              {cat.icon} {cat.label}
            </motion.button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{
            textAlign: 'center', padding: '40px',
            color: '#7A8C7E', fontSize: '13px'
          }}>
            Loading tips...
          </div>
        )}

        {/* Empty state */}
        {!loading && tips.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: '#fff', border: '0.5px solid #DDD8CC',
              borderRadius: '16px', padding: '40px', textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
            <p style={{
              color: '#1A3D2B', fontSize: '15px', fontWeight: 500,
              margin: '0 0 6px'
            }}>
              No tips yet in this category
            </p>
            <p style={{ color: '#7A8C7E', fontSize: '13px', margin: 0 }}>
              Be the first to share your experience!
            </p>
          </motion.div>
        )}

        {/* Tips list */}
        <motion.div className="space-y-3">
          <AnimatePresence>
            {tips.map((tip, i) => {
              const catColor = categoryColors[tip.category] || categoryColors.general;
              const catLabel = CATEGORIES.find(c => c.value === tip.category);
              const isOwner = tip.user_id === user?.id ||
                tip.full_name === user?.full_name;

              return (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{
                    y: -2,
                    boxShadow: '0 4px 16px rgba(26,61,43,0.06)'
                  }}
                  style={{
                    background: '#fff', border: '0.5px solid #DDD8CC',
                    borderRadius: '16px', padding: '18px 20px'
                  }}
                >
                  {/* Top row */}
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{
                        fontSize: '11px', padding: '3px 10px',
                        borderRadius: '20px', fontWeight: 500,
                        background: catColor.bg, color: catColor.text,
                      }}>
                        {catLabel?.icon} {catLabel?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ color: '#B8C4BC', fontSize: '11px' }}>
                        {timeAgo(tip.created_at)}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => handleDelete(tip.id)}
                          style={{
                            color: '#EA4B4B', fontSize: '11px',
                            background: 'none', border: 'none',
                            cursor: 'pointer', padding: '0'
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    color: '#1A3D2B', fontSize: '14px', fontWeight: 500,
                    margin: '0 0 6px'
                  }}>
                    {tip.title}
                  </h3>

                  {/* Content */}
                  <p style={{
                    color: '#5A6B5E', fontSize: '13px', lineHeight: 1.65,
                    margin: '0 0 14px'
                  }}>
                    {tip.content}
                  </p>

                  {/* Footer */}
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#B8C4BC', fontSize: '12px' }}>
                      by {tip.full_name}
                    </span>
                    <motion.button
                      onClick={() => handleLike(tip.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        background: tip.has_liked ? '#E1F5EE' : 'transparent',
                        border: `0.5px solid ${tip.has_liked ? '#9FE1CB' : '#DDD8CC'}`,
                        borderRadius: '20px', padding: '5px 12px',
                        cursor: 'pointer', fontSize: '12px',
                        color: tip.has_liked ? '#0F6E56' : '#7A8C7E',
                      }}
                    >
                      <span>{tip.has_liked ? '♥' : '♡'}</span>
                      <span>{tip.likes}</span>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
}