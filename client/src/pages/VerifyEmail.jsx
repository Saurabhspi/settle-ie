import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/auth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found.');
      return;
    }

    const verify = async () => {
      try {
        const res = await API.get(`/auth/verify-email?token=${token}`);

        // Auto login the user
        login(res.data.user, res.data.token);

        setStatus('success');
        setMessage(res.data.message);

        // Redirect to onboarding after 2 seconds
        setTimeout(() => navigate('/onboarding'), 2000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed.');
      }
    };

    verify();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#F7F3EB' }}>
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '40px',
        width: '100%', maxWidth: '420px', border: '0.5px solid #DDD8CC',
        textAlign: 'center',
      }}>
        <h1 style={{
          color: '#1A3D2B', fontSize: '22px', fontWeight: 500,
          margin: '0 0 24px'
        }}>
          Settle.ie
        </h1>

        {status === 'verifying' && (
          <div>
            <div style={{ fontSize: '40px', margin: '20px 0' }}>⏳</div>
            <p style={{ color: '#5A6B5E', fontSize: '14px' }}>
              Verifying your email address...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ fontSize: '40px', margin: '20px 0' }}>✅</div>
            <h2 style={{
              color: '#1A3D2B', fontSize: '18px', fontWeight: 500,
              margin: '0 0 8px'
            }}>
              Email verified!
            </h2>
            <p style={{ color: '#5A6B5E', fontSize: '13px', margin: '0 0 16px' }}>
              {message}
            </p>
            <p style={{ color: '#B8C4BC', fontSize: '12px' }}>
              Taking you to your roadmap setup...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ fontSize: '40px', margin: '20px 0' }}>❌</div>
            <h2 style={{
              color: '#1A3D2B', fontSize: '18px', fontWeight: 500,
              margin: '0 0 8px'
            }}>
              Verification failed
            </h2>
            <p style={{ color: '#5A6B5E', fontSize: '13px', margin: '0 0 20px' }}>
              {message}
            </p>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: '#1A3D2B', color: '#F7F3EB',
                padding: '10px 24px', borderRadius: '10px', border: 'none',
                fontSize: '13px', fontWeight: 500, cursor: 'pointer'
              }}
            >
              Register again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}