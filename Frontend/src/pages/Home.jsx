import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function FloatingOrb({ style }) {
  return (
    <div style={{
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(80px)',
      opacity: 0.18,
      pointerEvents: 'none',
      ...style,
    }} />
  );
}

function FeatureCard({ icon, title, description, gradient, tag, to, delay }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'linear-gradient(145deg, rgba(13,31,60,0.9), rgba(10,22,40,0.95))',
        border: '1px solid rgba(79,142,247,0.12)',
        borderRadius: 20,
        padding: '36px 30px',
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        animation: `fadeIn 0.6s ease ${delay}s both`,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = 'rgba(79,142,247,0.35)';
        e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(79,142,247,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(79,142,247,0.12)';
        e.currentTarget.style.boxShadow = 'none';
      }}>
        {/* Top accent line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 2,
          background: gradient,
          borderRadius: '20px 20px 0 0',
        }} />

        {/* Icon */}
        <div style={{
          width: 60,
          height: 60,
          background: gradient,
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          marginBottom: 20,
          boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
        }}>
          {icon}
        </div>

        <div style={{
          display: 'inline-block',
          padding: '3px 10px',
          background: 'rgba(79,142,247,0.1)',
          border: '1px solid rgba(79,142,247,0.2)',
          borderRadius: 100,
          fontSize: 11,
          fontWeight: 700,
          color: '#4f8ef7',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>{tag}</div>

        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 12,
          letterSpacing: '-0.02em',
        }}>{title}</h3>

        <p style={{
          fontSize: 15,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          marginBottom: 24,
        }}>{description}</p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 14,
          fontWeight: 600,
          color: '#4f8ef7',
        }}>
          Start Now
          <span style={{ transition: 'transform 0.2s' }}>→</span>
        </div>
      </div>
    </Link>
  );
}

function StatCard({ number, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 40,
        fontWeight: 800,
        background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1.1,
      }}>{number}</div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();

  const features = [
    {
      icon: '🎯',
      title: 'Interview AI',
      description: 'Practice with role-specific questions across 30+ career paths. Get instant AI feedback, scores, and personalized improvement tips.',
      gradient: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
      tag: 'AI Powered',
      to: user ? '/interview' : '/register',
      delay: 0.1,
    },
    {
      icon: '📄',
      title: 'Resume Analyzer',
      description: 'Paste your resume and get a full ATS audit — keyword gaps, formatting issues, and a line-by-line improvement roadmap.',
      gradient: 'linear-gradient(135deg, #06b6d4, #4f8ef7)',
      tag: 'ATS Optimized',
      to: user ? '/resume' : '/register',
      delay: 0.2,
    },
    {
      icon: '🚀',
      title: 'Career Guidance',
      description: 'Input your skills and education. Our AI maps your ideal career paths with salary ranges, required skills, and a step-by-step roadmap.',
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      tag: 'Personalized',
      to: user ? '/career' : '/register',
      delay: 0.3,
    },
  ];

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #050914 0%, #0a1628 50%, #050914 100%)',
      }}>
        {/* Background orbs */}
        <FloatingOrb style={{ width: 600, height: 600, background: '#4f8ef7', top: -200, right: -100 }} />
        <FloatingOrb style={{ width: 400, height: 400, background: '#7c3aed', bottom: -100, left: -50 }} />
        <FloatingOrb style={{ width: 300, height: 300, background: '#06b6d4', top: '40%', left: '30%' }} />

        {/* Grid overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(79,142,247,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,142,247,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 24px 80px', position: 'relative', zIndex: 1, textAlign: 'center', width: '100%' }}>
          
          {/* Headline */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(42px, 7vw, 84px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            marginBottom: 28,
            animation: 'fadeIn 0.6s ease 0.1s both',
          }}>
            <span style={{ color: 'var(--text-primary)' }}>Land Your</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #4f8ef7 0%, #7c3aed 50%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Dream Career</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>with AI</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--text-secondary)',
            maxWidth: 600,
            margin: '0 auto 48px',
            lineHeight: 1.7,
            fontWeight: 400,
            animation: 'fadeIn 0.6s ease 0.2s both',
          }}>
            Practice interviews, optimize your resume, and discover your ideal career path — all powered by cutting-edge AI that gives you real, actionable feedback.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            flexWrap: 'wrap',
            animation: 'fadeIn 0.6s ease 0.3s both',
          }}>
            <Link to={user ? '/dashboard' : '/register'} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 36px',
              background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
              color: 'white',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 8px 30px rgba(79,142,247,0.4)',
              transition: 'all 0.3s ease',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(79,142,247,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(79,142,247,0.4)'; }}>
              {user ? 'Go to Dashboard' : 'Start for Free'} →
            </Link>

            <Link to="/interview" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 36px',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-primary)',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: 'none',
              border: '1.5px solid rgba(255,255,255,0.12)',
              transition: 'all 0.3s ease',
              fontFamily: 'var(--font-body)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              Try Interview AI
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: 60,
            justifyContent: 'center',
            marginTop: 80,
            flexWrap: 'wrap',
            animation: 'fadeIn 0.6s ease 0.5s both',
          }}>
            <StatCard number="30+" label="Career Roles" />
            <StatCard number="AI" label="Instant Feedback" />
            <StatCard number="3" label="Core Tools" />
            
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          animation: 'fadeIn 1s ease 1s both',
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{
            width: 1,
            height: 40,
            background: 'linear-gradient(to bottom, rgba(79,142,247,0.5), transparent)',
          }} />
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 18px',
              background: 'rgba(79,142,247,0.08)',
              border: '1px solid rgba(79,142,247,0.2)',
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 700,
              color: '#4f8ef7',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}>What We Offer</div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 4vw, 52px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: 16,
            }}>Three tools. One platform.</h2>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
              Everything you need to go from job seeker to offer holder.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {features.map((f) => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 46px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: 12,
            }}>Ready in 3 steps</h2>
            <p style={{ fontSize: 17, color: 'var(--text-secondary)' }}>No setup. No credit card. Just results.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { step: '01', title: 'Create your free account', desc: 'Sign up in seconds. Your data is saved securely and privately.', icon: '👤' },
              { step: '02', title: 'Choose a tool', desc: 'Pick Interview AI, Resume Analyzer, or Career Guidance based on your immediate need.', icon: '🎯' },
              { step: '03', title: 'Get AI-powered results', desc: 'Receive detailed, personalized feedback instantly — no waiting, no generic advice.', icon: '⚡' },
            ].map(({ step, title, desc, icon }, i) => (
              <div key={step} style={{
                display: 'flex',
                gap: 28,
                alignItems: 'flex-start',
                padding: '32px 0',
                borderBottom: i < 2 ? '1px solid rgba(79,142,247,0.1)' : 'none',
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, rgba(79,142,247,0.15), rgba(124,58,237,0.15))',
                  border: '1px solid rgba(79,142,247,0.2)',
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}>{icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#4f8ef7', letterSpacing: '0.08em', marginBottom: 6 }}>STEP {step}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{
          maxWidth: 860,
          margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(79,142,247,0.12), rgba(124,58,237,0.12))',
          border: '1px solid rgba(79,142,247,0.2)',
          borderRadius: 28,
          padding: '64px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: -80, right: -80,
            width: 300, height: 300,
            background: '#4f8ef7',
            borderRadius: '50%',
            filter: 'blur(80px)',
            opacity: 0.08,
          }} />
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 46px)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: 16,
          }}>Start your career transformation</h2>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 480, margin: '0 auto 36px' }}>
            Join thousands of professionals who've accelerated their career with AI-powered tools.
          </p>
          <Link to={user ? '/dashboard' : '/register'} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '16px 40px',
            background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
            color: 'white',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 8px 30px rgba(79,142,247,0.4)',
            transition: 'all 0.3s',
            fontFamily: 'var(--font-body)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(79,142,247,0.55)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(79,142,247,0.4)'; }}>
            {user ? 'Go to Dashboard' : 'Create Free Account'} →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(79,142,247,0.1)',
        padding: '32px 24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 14,
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-secondary)', marginBottom: 8 }}>
          ✦ CareerGenie
        </div>
        AI-powered career tools. Built for ambitious professionals.
      </footer>
    </div>
  );
}