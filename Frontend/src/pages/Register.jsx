import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
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
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--text-secondary)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  };

  const onFocus = (e) => {
    e.target.style.borderColor = '#4f8ef7';
    e.target.style.background = 'rgba(79,142,247,0.06)';
    e.target.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.12)';
  };
  const onBlur = (e) => {
    e.target.style.borderColor = 'rgba(79,142,247,0.15)';
    e.target.style.background = 'rgba(255,255,255,0.04)';
    e.target.style.boxShadow = 'none';
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
      <div style={{ position: 'absolute', top: -100, left: -100, width: 500, height: 500, background: '#7c3aed', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.07, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, right: -80, width: 400, height: 400, background: '#4f8ef7', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.07, pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 460, animation: 'fadeIn 0.5s ease', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 28 }}>
            <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✦</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #f0f4ff, #4f8ef7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CareerGenie</span>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>Create your account</h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>Start your AI-powered career journey today</p>
        </div>

        <div style={{
          background: 'linear-gradient(145deg, rgba(13,31,60,0.95), rgba(10,22,40,0.98))',
          border: '1px solid rgba(79,142,247,0.15)',
          borderRadius: 24,
          padding: 36,
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}>
          {error && (
            <div style={{
              padding: '14px 18px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10,
              color: '#fca5a5', fontSize: 14, fontWeight: 500, marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={labelStyle}>Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Jane Smith" required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={labelStyle}>Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={labelStyle}>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={labelStyle}>Confirm Password</label>
              <input name="confirm" type="password" value={form.confirm} onChange={handleChange} placeholder="Repeat your password" required style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>

            {/* Password strength hint */}
            {form.password.length > 0 && (
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{
                    height: 3,
                    flex: 1,
                    borderRadius: 3,
                    background: form.password.length > i * 3
                      ? i < 2 ? '#ef4444' : i < 3 ? '#f59e0b' : '#10b981'
                      : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.3s',
                  }} />
                ))}
                <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 4 }}>
                  {form.password.length < 6 ? 'Too short' : form.password.length < 10 ? 'Fair' : 'Strong'}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                background: loading ? 'rgba(79,142,247,0.4)' : 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s', fontFamily: 'var(--font-body)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: loading ? 'none' : '0 6px 20px rgba(79,142,247,0.35)',
                marginTop: 6,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(79,142,247,0.5)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 6px 20px rgba(79,142,247,0.35)'; }}
            >
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Creating account...
                </>
              ) : 'Create Account →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 15, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#4f8ef7', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
            onMouseLeave={e => e.target.style.textDecoration = 'none'}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}