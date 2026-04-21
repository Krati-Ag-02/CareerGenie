import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px 40px',
      background: 'linear-gradient(135deg, #050914, #0a1628, #050914)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'absolute', top: -150, right: -100, width: 500, height: 500, background: '#4f8ef7', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.07, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -80, width: 400, height: 400, background: '#7c3aed', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.07, pointerEvents: 'none' }} />

      <div style={{
        width: '100%',
        maxWidth: 440,
        animation: 'fadeIn 0.5s ease',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            marginBottom: 28,
          }}>
            <div style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}>✦</div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #f0f4ff, #4f8ef7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>CareerGenie</span>
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30,
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            marginBottom: 8,
          }}>Welcome back</h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            Sign in to continue your career journey
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(13,31,60,0.95), rgba(10,22,40,0.98))',
          border: '1px solid rgba(79,142,247,0.15)',
          borderRadius: 24,
          padding: 36,
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}>
          {error && (
            <div style={{
              padding: '14px 18px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10,
              color: '#fca5a5',
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(79,142,247,0.15)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 15,
                  outline: 'none',
                  transition: 'all 0.2s',
                  width: '100%',
                }}
                onFocus={e => { e.target.style.borderColor = '#4f8ef7'; e.target.style.background = 'rgba(79,142,247,0.06)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(79,142,247,0.15)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(79,142,247,0.15)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 15,
                  outline: 'none',
                  transition: 'all 0.2s',
                  width: '100%',
                }}
                onFocus={e => { e.target.style.borderColor = '#4f8ef7'; e.target.style.background = 'rgba(79,142,247,0.06)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(79,142,247,0.15)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                background: loading ? 'rgba(79,142,247,0.4)' : 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                fontFamily: 'var(--font-body)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: loading ? 'none' : '0 6px 20px rgba(79,142,247,0.35)',
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(79,142,247,0.5)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 6px 20px rgba(79,142,247,0.35)'; }}
            >
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Signing in...
                </>
              ) : 'Sign In →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 15, color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#4f8ef7', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
            onMouseLeave={e => e.target.style.textDecoration = 'none'}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}