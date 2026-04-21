import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DashCard({ icon, title, desc, to, gradient, tag }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'linear-gradient(145deg, #0d1f3c, #0a1628)',
        border: '1px solid rgba(79,142,247,0.12)',
        borderRadius: 20,
        padding: '30px 26px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.borderColor = 'rgba(79,142,247,0.3)';
        e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(79,142,247,0.12)';
        e.currentTarget.style.boxShadow = 'none';
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: gradient, borderRadius: '20px 20px 0 0' }} />
        <div style={{
          width: 52, height: 52, background: gradient,
          borderRadius: 14, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 24, marginBottom: 18,
          boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
        }}>{icon}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#4f8ef7', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{tag}</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>{title}</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{desc}</p>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#4f8ef7', display: 'flex', alignItems: 'center', gap: 6 }}>
          Open Tool <span>→</span>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user, getInitials } = useAuth();

  const tools = [
    {
      icon: '🎯',
      title: 'Interview AI',
      desc: 'Choose a role and practice with real interview questions. Get scored and receive actionable feedback instantly.',
      to: '/interview',
      gradient: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
      tag: 'AI Powered',
    },
    {
      icon: '📄',
      title: 'Resume Analyzer',
      desc: 'Paste your resume and get an ATS score, missing keywords, and a full improvement roadmap.',
      to: '/resume',
      gradient: 'linear-gradient(135deg, #06b6d4, #4f8ef7)',
      tag: 'ATS Optimizer',
    },
    {
      icon: '🚀',
      title: 'Career Guidance',
      desc: 'Get personalized career recommendations based on your skills, education, and interests.',
      to: '/career',
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      tag: 'Personalized',
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      paddingTop: 80,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 48,
          flexWrap: 'wrap',
          gap: 20,
          animation: 'fadeIn 0.5s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              fontWeight: 800,
              color: 'white',
              boxShadow: '0 8px 25px rgba(79,142,247,0.4)',
              flexShrink: 0,
            }}>{getInitials(user?.name)}</div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>{greeting},</div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(22px, 4vw, 34px)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
              }}>{user?.name} 👋</h1>
            </div>
          </div>

          <div style={{
            padding: '10px 20px',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 600,
            color: '#6ee7b7',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
            AI Tools Ready
          </div>
        </div>

        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(79,142,247,0.1), rgba(124,58,237,0.1))',
          border: '1px solid rgba(79,142,247,0.18)',
          borderRadius: 20,
          padding: '28px 32px',
          marginBottom: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeIn 0.5s ease 0.1s both',
        }}>
          <div style={{ position: 'absolute', right: -60, top: -60, width: 200, height: 200, background: '#4f8ef7', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.08 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4f8ef7', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>✦ Pro Tip</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Start with Interview AI</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 460 }}>
              Select a role, answer 5 real interview questions, and get an instant AI evaluation with scores and improvements.
            </p>
          </div>
          <Link to="/interview" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 26px',
            background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
            color: 'white', borderRadius: 10,
            fontSize: 14, fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 4px 15px rgba(79,142,247,0.35)',
            whiteSpace: 'nowrap',
            transition: 'all 0.3s',
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(79,142,247,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(79,142,247,0.35)'; }}>
            Start Practicing →
          </Link>
        </div>

        {/* Tools Grid */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 24, letterSpacing: '-0.02em' }}>
            Your AI Tools
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 20 }}>
            {tools.map((t, i) => (
              <div key={t.title} style={{ animation: `fadeIn 0.5s ease ${0.15 + i * 0.1}s both` }}>
                <DashCard {...t} />
              </div>
            ))}
          </div>
        </div>

       
      </div>
    </div>
  );
}