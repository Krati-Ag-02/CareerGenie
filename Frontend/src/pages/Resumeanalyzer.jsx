import React, { useState } from 'react';
import { resumeAPI } from '../api/api';

function ScoreBar({ label, value, max = 25, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}/{max}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 3,
          transition: 'width 1s ease',
        }} />
      </div>
    </div>
  );
}

function ATSRing({ score }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#ef4444' : '#8b5cf6';
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Work' : 'Poor';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 130, height: 130, borderRadius: '50%',
        background: `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,0.04) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 40px ${color}30`,
        position: 'relative',
      }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: '#0a1628',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>ATS Score</span>
        </div>
      </div>
      <span style={{
        padding: '5px 18px', borderRadius: 100, fontSize: 14, fontWeight: 700,
        background: `${color}18`, color, border: `1px solid ${color}40`,
        fontFamily: 'var(--font-display)',
      }}>{label}</span>
    </div>
  );
}

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!resumeText.trim() || resumeText.length < 100) {
      return setError('Please paste your full resume (minimum 100 characters).');
    }
    setError('');
    setLoading(true);
    setAnalysis(null);
    try {
      const data = await resumeAPI.analyze({ resumeText, targetRole: targetRole || undefined });
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnalysis(null);
    setResumeText('');
    setTargetRole('');
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: 80 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 36, animation: 'fadeIn 0.5s ease' }}>
          <div style={{ display: 'inline-block', padding: '5px 14px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 100, fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
            📄 Resume Analyzer
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 10 }}>
            ATS Resume Analyzer
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 560 }}>
            Paste your resume below. Our AI will give you a full ATS audit, missing keywords, and a concrete improvement roadmap.
          </p>
        </div>

        {!analysis ? (
          <div style={{ animation: 'fadeIn 0.5s ease 0.1s both' }}>
            {error && (
              <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#fca5a5', fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ background: 'linear-gradient(145deg, #0d1f3c, #0a1628)', border: '1px solid rgba(79,142,247,0.12)', borderRadius: 20, padding: '32px' }}>
              {/* Optional target role */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Target Role (Optional)
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer, Product Manager..."
                  style={{
                    width: '100%', padding: '13px 18px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1.5px solid rgba(79,142,247,0.15)',
                    borderRadius: 10, color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)', fontSize: 15,
                    outline: 'none', transition: 'all 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#4f8ef7'; e.target.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(79,142,247,0.15)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Resume input */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Paste Your Resume *
                </label>
                <textarea
                  value={resumeText}
                  onChange={e => { setResumeText(e.target.value); setError(''); }}
                  placeholder="Paste your full resume text here...

Include: Contact info, Summary, Experience, Education, Skills, Certifications..."
                  rows={16}
                  style={{
                    width: '100%', padding: '16px 18px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1.5px solid rgba(79,142,247,0.15)',
                    borderRadius: 12, color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)', fontSize: 14,
                    resize: 'vertical', outline: 'none',
                    lineHeight: 1.7, transition: 'all 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#4f8ef7'; e.target.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(79,142,247,0.15)'; e.target.style.boxShadow = 'none'; }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Minimum 100 characters</span>
                  <span style={{ fontSize: 12, color: resumeText.length >= 100 ? '#10b981' : 'var(--text-muted)' }}>{resumeText.length} chars</span>
                </div>
              </div>

              <button
                onClick={analyze}
                disabled={loading || resumeText.length < 100}
                style={{
                  width: '100%', padding: '15px',
                  background: loading || resumeText.length < 100 ? 'rgba(6,182,212,0.3)' : 'linear-gradient(135deg, #06b6d4, #4f8ef7)',
                  color: 'white', border: 'none', borderRadius: 10,
                  fontSize: 15, fontWeight: 700,
                  cursor: loading || resumeText.length < 100 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s', fontFamily: 'var(--font-body)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: loading || resumeText.length < 100 ? 'none' : '0 6px 20px rgba(6,182,212,0.3)',
                }}
                onMouseEnter={e => { if (!loading && resumeText.length >= 100) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(6,182,212,0.45)'; }}}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {loading ? (
                  <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> AI is analyzing your resume...</>
                ) : 'Analyze Resume →'}
              </button>
            </div>
          </div>
        ) : (
          /* ── RESULTS ─────────────────────────────────────────────────── */
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* Overall Score */}
            <div style={{
              background: 'linear-gradient(145deg, #0d1f3c, #0a1628)',
              border: '1px solid rgba(79,142,247,0.15)',
              borderRadius: 20, padding: '36px',
              display: 'flex', gap: 36, alignItems: 'center',
              flexWrap: 'wrap', marginBottom: 20,
            }}>
              <ATSRing score={analysis.atsScore} />
              <div style={{ flex: 1, minWidth: 220 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 12 }}>ATS Analysis Complete</h2>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>{analysis.overallAssessment}</p>
                {analysis.scoreBreakdown && (
                  <div>
                    <ScoreBar label="Formatting" value={analysis.scoreBreakdown.formatting} color="#4f8ef7" />
                    <ScoreBar label="Keywords" value={analysis.scoreBreakdown.keywords} color="#7c3aed" />
                    <ScoreBar label="Experience" value={analysis.scoreBreakdown.experience} color="#06b6d4" />
                    <ScoreBar label="Skills" value={analysis.scoreBreakdown.skills} color="#10b981" />
                  </div>
                )}
              </div>
            </div>

            {/* Strengths */}
            {analysis.strengths?.length > 0 && (
              <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: 24, marginBottom: 16, animation: 'fadeIn 0.5s ease 0.1s both' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#6ee7b7', marginBottom: 14 }}>✓ Resume Strengths</h3>
                {analysis.strengths.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <span style={{ color: '#10b981', flexShrink: 0 }}>●</span> {s}
                  </div>
                ))}
              </div>
            )}

            {/* Missing Keywords */}
            {analysis.missingKeywords?.length > 0 && (
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 16, padding: 24, marginBottom: 16, animation: 'fadeIn 0.5s ease 0.2s both' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fca5a5', marginBottom: 14 }}>⚡ Missing Keywords</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>Add these to improve ATS ranking:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {analysis.missingKeywords.map((k, i) => (
                    <span key={i} style={{ padding: '5px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 100, fontSize: 13, fontWeight: 500, color: '#fca5a5' }}>{k}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {analysis.improvements?.length > 0 && (
              <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 16, padding: 24, marginBottom: 16, animation: 'fadeIn 0.5s ease 0.3s both' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fde68a', marginBottom: 16 }}>💡 Section-by-Section Improvements</h3>
                {analysis.improvements.map((item, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: 12, padding: '16px 18px', marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>{item.section}</div>
                    <div style={{ fontSize: 13, color: '#fca5a5', marginBottom: 6 }}>⚠ {item.issue}</div>
                    <div style={{ fontSize: 13, color: '#6ee7b7' }}>✓ {item.fix}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Wins */}
            {analysis.quickWins?.length > 0 && (
              <div style={{ background: 'rgba(79,142,247,0.05)', border: '1px solid rgba(79,142,247,0.18)', borderRadius: 16, padding: 24, marginBottom: 16, animation: 'fadeIn 0.5s ease 0.35s both' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#93c5fd', marginBottom: 14 }}>⚡ Quick Wins (Do These First)</h3>
                {analysis.quickWins.map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <span style={{ color: '#4f8ef7', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span> {w}
                  </div>
                ))}
              </div>
            )}

            {/* Suggested Roles */}
            {analysis.suggestedRoles?.length > 0 && (
              <div style={{ background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.18)', borderRadius: 16, padding: 24, marginBottom: 24, animation: 'fadeIn 0.5s ease 0.4s both' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#c4b5fd', marginBottom: 12 }}>🎯 Matching Roles for This Resume</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {analysis.suggestedRoles.map((r, i) => (
                    <span key={i} style={{ padding: '6px 16px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 100, fontSize: 13, fontWeight: 600, color: '#c4b5fd' }}>{r}</span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={reset}
              style={{
                width: '100%', padding: '15px',
                background: 'linear-gradient(135deg, #06b6d4, #4f8ef7)',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-body)', transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Analyze Another Resume →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}