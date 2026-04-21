import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, getInitials } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = user
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/interview', label: 'Interview AI' },
        { to: '/resume', label: 'Resume' },
        { to: '/career', label: 'Career' },
      ]
    : [
        { to: '/', label: 'Home' },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      transition: 'all 0.3s ease',
      background: scrolled
        ? 'rgba(5,9,20,0.92)'
        : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(79,142,247,0.12)' : '1px solid transparent',
      boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.3)' : 'none',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            boxShadow: '0 4px 15px rgba(79,142,247,0.4)',
          }}>✦</div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #f0f4ff, #4f8ef7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>CareerGenie</span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: isActive(to) ? 'var(--accent-primary)' : 'var(--text-secondary)',
              background: isActive(to) ? 'rgba(79,142,247,0.1)' : 'transparent',
              border: isActive(to) ? '1px solid rgba(79,142,247,0.2)' : '1px solid transparent',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              if (!isActive(to)) {
                e.target.style.color = 'var(--text-primary)';
                e.target.style.background = 'rgba(255,255,255,0.05)';
              }
            }}
            onMouseLeave={e => {
              if (!isActive(to)) {
                e.target.style.color = 'var(--text-secondary)';
                e.target.style.background = 'transparent';
              }
            }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'rgba(79,142,247,0.08)',
                border: '1.5px solid rgba(79,142,247,0.2)',
                borderRadius: 40,
                padding: '6px 14px 6px 6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(79,142,247,0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(79,142,247,0.2)'}
              >
                {/* Avatar */}
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'white',
                  flexShrink: 0,
                }}>
                  {getInitials(user.name)}
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.name.split(' ')[0]}
                </span>
                <span style={{
                  fontSize: 10,
                  color: 'var(--text-secondary)',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s',
                }}>▼</span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: 8,
                  minWidth: 200,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  animation: 'scaleIn 0.15s ease',
                }}>
                  <div style={{ padding: '10px 14px 14px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user.email}</div>
                  </div>
                  {[
                    { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
                    { to: '/interview', icon: '🎯', label: 'Interview AI' },
                    { to: '/resume', icon: '📄', label: 'Resume Analyzer' },
                    { to: '/career', icon: '🚀', label: 'Career Guidance' },
                  ].map(({ to, icon, label }) => (
                    <Link key={to} to={to} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      fontSize: 14,
                      color: isActive(to) ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      background: isActive(to) ? 'rgba(79,142,247,0.08)' : 'transparent',
                      transition: 'all 0.15s',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={e => { if (!isActive(to)) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
                    onMouseLeave={e => { if (!isActive(to)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}>
                      <span>{icon}</span>{label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
                    <button onClick={handleLogout} style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      fontSize: 14,
                      color: '#fca5a5',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span>→</span> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/login" style={{
                padding: '9px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                background: 'transparent',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { e.target.style.color = 'var(--text-primary)'; e.target.style.borderColor = 'var(--border-hover)'; }}
              onMouseLeave={e => { e.target.style.color = 'var(--text-secondary)'; e.target.style.borderColor = 'var(--border)'; }}>
                Sign In
              </Link>
              <Link to="/register" style={{
                padding: '9px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: 'white',
                background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(79,142,247,0.3)',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(79,142,247,0.45)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(79,142,247,0.3)'; }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </nav>
  );
}