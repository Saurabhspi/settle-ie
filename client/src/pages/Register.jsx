import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerUser } from '../api/auth';

export default function Register() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await registerUser(form);
      // Don't log in yet — show verification message instead
      setEmailSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Show success screen after registration
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: '#F7F3EB' }}>
        <div style={{
          background: '#fff', borderRadius: '20px', padding: '40px',
          width: '100%', maxWidth: '420px', border: '0.5px solid #DDD8CC',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
          <h1 style={{
            color: '#1A3D2B', fontSize: '22px', fontWeight: 500,
            margin: '0 0 8px'
          }}>
            Check your email!
          </h1>
          <p style={{
            color: '#5A6B5E', fontSize: '14px', lineHeight: 1.7,
            margin: '0 0 8px'
          }}>
            We sent a verification link to
          </p>
          <p style={{
            color: '#1A3D2B', fontSize: '14px', fontWeight: 500,
            margin: '0 0 20px'
          }}>
            {form.email}
          </p>
          <div style={{
            background: '#F7F3EB', borderRadius: '12px',
            padding: '16px', marginBottom: '20px'
          }}>
            <p style={{
              color: '#5A6B5E', fontSize: '13px', lineHeight: 1.6,
              margin: 0
            }}>
              Click the link in the email to verify your account.
              Once verified you'll be taken to your personalised roadmap.
            </p>
          </div>
          <p style={{ color: '#B8C4BC', fontSize: '12px', margin: '0 0 16px' }}>
            Didn't receive it? Check your spam folder.
          </p>
          <Link to="/login" style={{
            color: '#0F6E56', fontSize: '13px',
            fontWeight: 500, textDecoration: 'none'
          }}>
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#F7F3EB' }}>
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '40px',
        width: '100%', maxWidth: '420px', border: '0.5px solid #DDD8CC',
      }}>

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 style={{
            color: '#1A3D2B', fontSize: '22px', fontWeight: 500,
            margin: 0
          }}>
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
          Create your account
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
              Full name
            </label>
            <input
              type="text"
              placeholder="Saurabh Anand"
              style={{
                width: '100%', border: '0.5px solid #DDD8CC',
                borderRadius: '10px', padding: '11px 14px', fontSize: '13px',
                outline: 'none', background: '#FDFBF7', boxSizing: 'border-box'
              }}
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </div>

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
                width: '100%', border: '0.5px solid #DDD8CC',
                borderRadius: '10px', padding: '11px 14px', fontSize: '13px',
                outline: 'none', background: '#FDFBF7', boxSizing: 'border-box'
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
              placeholder="At least 6 characters"
              style={{
                width: '100%', border: '0.5px solid #DDD8CC',
                borderRadius: '10px', padding: '11px 14px', fontSize: '13px',
                outline: 'none', background: '#FDFBF7', boxSizing: 'border-box'
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
              padding: '12px', borderRadius: '10px', fontSize: '13px',
              fontWeight: 500, border: 'none', cursor: 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{
          textAlign: 'center', fontSize: '13px', color: '#7A8C7E',
          marginTop: '24px'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{
            color: '#0F6E56', fontWeight: 500,
            textDecoration: 'none'
          }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}