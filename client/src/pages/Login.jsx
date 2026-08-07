import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser(form);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#F7F3EB' }}>
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '40px',
        width: '100%', maxWidth: '420px', border: '0.5px solid #DDD8CC'
      }}>

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 style={{ color: '#1A3D2B', fontSize: '22px', fontWeight: 500, margin: 0 }}>
            Settle.ie
          </h1>
          <p style={{ color: '#7A8C7E', fontSize: '13px', margin: '4px 0 0' }}>
            Your Irish relocation guide
          </p>
        </div>

        <h2 style={{
          color: '#1A3D2B', fontSize: '18px', fontWeight: 500,
          margin: '0 0 24px'
        }}>
          Welcome back
        </h2>

        {error && (
          <div style={{
            background: '#FEF2F2', color: '#991B1B', fontSize: '13px',
            padding: '12px 16px', borderRadius: '10px', marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label style={{
              display: 'block', fontSize: '13px', color: '#5A6B5E',
              marginBottom: '6px'
            }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              style={{
                width: '100%', border: '0.5px solid #DDD8CC', borderRadius: '10px',
                padding: '11px 14px', fontSize: '13px', outline: 'none',
                background: '#FDFBF7', boxSizing: 'border-box'
              }}
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: '13px', color: '#5A6B5E',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Your password"
              style={{
                width: '100%', border: '0.5px solid #DDD8CC', borderRadius: '10px',
                padding: '11px 14px', fontSize: '13px', outline: 'none',
                background: '#FDFBF7', boxSizing: 'border-box'
              }}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: '#1A3D2B', color: '#F7F3EB',
              padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
              border: 'none', cursor: 'pointer', opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Starting up server, please wait...' : 'Sign in'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', fontSize: '13px', color: '#7A8C7E',
          marginTop: '24px'
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{
            color: '#0F6E56', fontWeight: 500,
            textDecoration: 'none'
          }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}