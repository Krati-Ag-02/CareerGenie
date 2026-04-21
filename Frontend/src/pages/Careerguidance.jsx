import React, { useState } from 'react';
import { careerAPI } from '../api/api';

function RoleCard({ role, index }) {
  const [open, setOpen] = useState(index === 0);
  const matchColor = role.matchScore >= 85 ? '#10b981' : role.matchScore >= 70 ? '#4f8ef7' : '#f59e0b';

  return (
    <div style={{
      background: 'linear-gradient(145deg, #0d1f3c, #0a1628)',
      border: `1px solid ${open ? 'rgba(79,142,247,0.3)' : 'rgba(79,142,247,0.1)'}`,
      borderRadius: 18,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      animation: `fadeIn 0.5s ease ${index * 0.12}s both`,
      marginBottom: 16,
    }}>
      {/* Header */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: '22px 26px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, overflow: 'hidden' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: `linear-gradient(135deg, ${matchColor}22, ${matchColor}11)`,
            border: `1px solid ${matchColor}44`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: matchColor, lineHeight: 1 }}>{role.matchScore}</span>
            <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>match</span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>{role.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{role.description}</p>
          </div>
        </div>
        <div style={{
          fontSize: 13, fontWeight: 600, color: '#4f8ef7',
          display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
        }}>
          {role.salaryRange?.mid && <span style={{ color: '#10b981', fontFamily: 'var(--font-display)' }}>{role.salaryRange.mid}</span>}
          <span style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', fontSize: 10 }}>▼</span>
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div style={{ padding: '0 26px 26px', borderTop: '1px solid rgba(79,142,247,0.08)', paddingTop: 22 }}>
          {/* Why it fits */}
          <div style={{ background: 'rgba(79,142,247,0.06)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4f8ef7', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Why It Fits You</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{role.whyItFits}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
            {/* Salary */}
            {role.salaryRange && (
              <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>💰 Salary Range (USD)</div>
                {[['Entry', role.salaryRange.entry], ['Mid-level', role.salaryRange.mid], ['Senior', role.salaryRange.senior]].map(([label, val]) => val && (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ color: '#6ee7b7', fontWeight: 600, fontFamily: 'var(--font-display)' }}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Top Companies */}
            {role.topCompanies?.length > 0 && (
              <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>🏢 Top Hiring Companies</div>
                {role.topCompanies.map((c, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#7c3aed' }}>●</span> {c}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Required Skills */}
          {role.requiredSkills?.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>Required Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {role.requiredSkills.map((s, i) => (
                  <span key={i} style={{ padding: '5px 13px', background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 100, fontSize: 12, fontWeight: 600, color: '#93c5fd' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Learning Path */}
          {role.learningPath?.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>🎯 Learning Path</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {role.learningPath.map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: 'white',
                    }}>{i + 1}</div>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, paddingTop: 3 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CareerGuidance() {
  const [form, setForm] = useState({ skills: '', education: '', interests: '', experience: '' });
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const submit = async () => {
    if (!form.skills.trim()) return setError('Please enter your skills.');
    if (!form.education.trim()) return setError('Please enter your education background.');
    setError('');
    setLoading(true);
    setGuidance(null);
    try {
      const data = await careerAPI.getGuidance(form);
      setGuidance(data.guidance);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setGuidance(null);
    setForm({ skills: '', education: '', interests: '', experience: '' });
  };

  const inputStyle = {
    width: '100%', padding: '13px 18px',
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(79,142,247,0.15)',
    borderRadius: 10, color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)', fontSize: 15,
    outline: 'none', transition: 'all 0.2s',
  };
  const onFocus = (e) => { e.target.style.borderColor = '#4f8ef7'; e.target.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.12)'; };
  const onBlur = (e) => { e.target.style.borderColor = 'rgba(79,142,247,0.15)'; e.target.style.boxShadow = 'none'; };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: 80 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36, animation: 'fadeIn 0.5s ease' }}>
          <div style={{ display: 'inline-block', padding: '5px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 100, fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
            🚀 Career Guidance
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 10 }}>
            AI Career Guidance
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 560 }}>
            Tell us about your background and we'll map out the best career paths, salary ranges, and a step-by-step plan to get there.
          </p>
        </div>

        {!guidance ? (
          <div style={{ animation: 'fadeIn 0.5s ease 0.1s both' }}>
            {error && (
              <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#fca5a5', fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ background: 'linear-gradient(145deg, #0d1f3c, #0a1628)', border: '1px solid rgba(79,142,247,0.12)', borderRadius: 20, padding: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Your Skills *</label>
                  <textarea
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    rows={4}
                    placeholder="e.g. Python, React, SQL, Machine Learning, Data Analysis, Communication, Project Management..."
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Education *</label>
                  <textarea
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    rows={4}
                    placeholder="e.g. B.Tech Computer Science from IIT Delhi, MBA from IIM Ahmedabad, Self-taught with online certifications..."
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 28 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Interests (Optional)</label>
                  <input
                    name="interests"
                    type="text"
                    value={form.interests}
                    onChange={handleChange}
                    placeholder="e.g. AI, product design, building startups, helping people..."
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Experience Level (Optional)</label>
                  <select
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={onFocus} onBlur={onBlur}
                  >
                    <option value="">— Select level —</option>
                    <option value="Student / No experience">Student / No experience</option>
                    <option value="Entry level (0-2 years)">Entry level (0-2 years)</option>
                    <option value="Mid level (3-5 years)">Mid level (3-5 years)</option>
                    <option value="Senior (6-10 years)">Senior (6-10 years)</option>
                    <option value="Lead / Principal (10+ years)">Lead / Principal (10+ years)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={submit}
                disabled={loading}
                style={{
                  width: '100%', padding: '15px',
                  background: loading ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  color: 'white', border: 'none', borderRadius: 10,
                  fontSize: 15, fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s', fontFamily: 'var(--font-body)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: loading ? 'none' : '0 6px 20px rgba(245,158,11,0.3)',
                }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(245,158,11,0.45)'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {loading ? (
                  <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> AI is building your roadmap...</>
                ) : 'Get My Career Guidance →'}
              </button>
            </div>
          </div>
        ) : (
          /* ── RESULTS ─────────────────────────────────────────────── */
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>
                Your Career Roadmap
              </h2>
              <button onClick={reset} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(79,142,247,0.25)', borderRadius: 10, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f8ef7'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(79,142,247,0.25)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                ← New Analysis
              </button>
            </div>

            {/* Top roles */}
            {guidance.topRecommendedRoles?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>🎯 Recommended Career Paths</div>
                {guidance.topRecommendedRoles.map((role, i) => <RoleCard key={i} role={role} index={i} />)}
              </div>
            )}

            {/* Timeline */}
            {guidance.careerTimeline && (
              <div style={{ background: 'linear-gradient(145deg, #0d1f3c, #0a1628)', border: '1px solid rgba(79,142,247,0.12)', borderRadius: 16, padding: 24, marginBottom: 16, animation: 'fadeIn 0.5s ease 0.3s both' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>🗓️ Your Career Timeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { label: '6 Months', icon: '🌱', value: guidance.careerTimeline.shortTerm, color: '#10b981' },
                    { label: '1-2 Years', icon: '📈', value: guidance.careerTimeline.mediumTerm, color: '#4f8ef7' },
                    { label: '3-5 Years', icon: '🏆', value: guidance.careerTimeline.longTerm, color: '#f59e0b' },
                  ].map(({ label, icon, value, color }, i, arr) => (
                    <div key={label} style={{ display: 'flex', gap: 16, paddingBottom: i < arr.length - 1 ? 20 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${color}20`, border: `1px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{icon}</div>
                        {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />}
                      </div>
                      <div style={{ paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Gaps & Certs side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 16 }}>
              {guidance.skillGaps?.length > 0 && (
                <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 16, padding: 22, animation: 'fadeIn 0.5s ease 0.35s both' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fca5a5', marginBottom: 14 }}>⚡ Skill Gaps to Close</h3>
                  {guidance.skillGaps.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <span style={{ color: '#ef4444' }}>●</span> {s}
                    </div>
                  ))}
                </div>
              )}
              {guidance.certifications?.length > 0 && (
                <div style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 16, padding: 22, animation: 'fadeIn 0.5s ease 0.4s both' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#67e8f9', marginBottom: 14 }}>🏅 Recommended Certifications</h3>
                  {guidance.certifications.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <span style={{ color: '#06b6d4' }}>●</span> {c}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Industry Trends */}
            {guidance.industryTrends && (
              <div style={{ background: 'rgba(79,142,247,0.05)', border: '1px solid rgba(79,142,247,0.15)', borderRadius: 16, padding: 22, marginBottom: 16, animation: 'fadeIn 0.5s ease 0.45s both' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#93c5fd', marginBottom: 10 }}>📊 Industry Trends</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{guidance.industryTrends}</p>
              </div>
            )}

            {/* Action Steps */}
            {guidance.actionableAdvice?.length > 0 && (
              <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 16, padding: 22, marginBottom: 28, animation: 'fadeIn 0.5s ease 0.5s both' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#6ee7b7', marginBottom: 14 }}>✅ Start These Actions Now</h3>
                {guidance.actionableAdvice.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: 'linear-gradient(135deg, #10b981, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white', flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, paddingTop: 2 }}>{a}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}