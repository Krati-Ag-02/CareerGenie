import React, { useState, useEffect } from 'react';
import { interviewAPI } from '../api/api';

function ScoreRing({ score }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#ef4444' : '#8b5cf6';
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : score >= 50 ? 'C+' : score >= 40 ? 'C' : 'D';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 110, height: 110, borderRadius: '50%',
        background: `conic-gradient(${color} ${score * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 30px ${color}33`,
        position: 'relative',
      }}>
        <div style={{
          width: 84, height: 84, borderRadius: '50%',
          background: '#0a1628',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>/ 100</span>
        </div>
      </div>
      <span style={{
        padding: '4px 14px', borderRadius: 100, fontSize: 13, fontWeight: 800,
        background: `${color}22`, color, border: `1px solid ${color}44`,
        fontFamily: 'var(--font-display)',
      }}>Grade: {grade}</span>
    </div>
  );
}

export default function Interview() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [allEvals, setAllEvals] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingQs, setLoadingQs] = useState(false);
  const [loadingEval, setLoadingEval] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('select'); // select | practice | result | summary

  useEffect(() => {
    interviewAPI.getRoles()
      .then(data => setRoles(data.roles))
      .catch(() => setError('Failed to load roles.'))
      .finally(() => setLoadingRoles(false));
  }, []);

  const startSession = async () => {
    if (!selectedRole) return setError('Please select a role.');
    setError('');
    setLoadingQs(true);
    try {
      const data = await interviewAPI.getQuestions(selectedRole);
      setQuestions(data.questions);
      setCurrentQ(0);
      setAllEvals([]);
      setAnswer('');
      setEvaluation(null);
      setPhase('practice');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingQs(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return setError('Please write an answer before submitting.');
    if (answer.trim().length < 15) return setError('Please write a more detailed answer.');
    setError('');
    setLoadingEval(true);
    try {
      const data = await interviewAPI.evaluate({ role: selectedRole, question: questions[currentQ], answer });
      setEvaluation(data.evaluation);
      setAllEvals(prev => [...prev, { question: questions[currentQ], answer, evaluation: data.evaluation }]);
      setPhase('result');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingEval(false);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setPhase('summary');
    } else {
      setCurrentQ(currentQ + 1);
      setAnswer('');
      setEvaluation(null);
      setPhase('practice');
    }
  };

  const restart = () => {
    setPhase('select');
    setSelectedRole('');
    setQuestions([]);
    setAllEvals([]);
    setEvaluation(null);
    setAnswer('');
  };

  const avgScore = allEvals.length > 0
    ? Math.round(allEvals.reduce((s, e) => s + e.evaluation.score, 0) / allEvals.length)
    : 0;

  // ── SELECT ROLE ────────────────────────────────────────────────────────────
  if (phase === 'select') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: 80 }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 40, animation: 'fadeIn 0.5s ease' }}>
          <div style={{ display: 'inline-block', padding: '5px 14px', background: 'rgba(79,142,247,0.1)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 100, fontSize: 11, fontWeight: 700, color: '#4f8ef7', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>
            🎯 Interview AI
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12 }}>
            AI Interview Practice
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 560 }}>
            Select your target role. Our AI will generate  real interview questions and evaluate your answers with detailed scoring and feedback.
          </p>
        </div>

        {error && (
          <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#fca5a5', fontSize: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚠ {error}
          </div>
        )}

        <div style={{
          background: 'linear-gradient(145deg, #0d1f3c, #0a1628)',
          border: '1px solid rgba(79,142,247,0.12)',
          borderRadius: 20,
          padding: '32px',
          animation: 'fadeIn 0.5s ease 0.1s both',
        }}>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
              Select Target Role
            </label>
            {loadingRoles ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: 14 }}>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(79,142,247,0.2)', borderTopColor: '#4f8ef7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Loading roles...
              </div>
            ) : (
              <select
                value={selectedRole}
                onChange={e => { setSelectedRole(e.target.value); setError(''); }}
                style={{
                  width: '100%', padding: '14px 18px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(79,142,247,0.15)',
                  borderRadius: 10, color: selectedRole ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-body)', fontSize: 15,
                  outline: 'none', cursor: 'pointer', transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#4f8ef7'; e.target.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(79,142,247,0.15)'; e.target.style.boxShadow = 'none'; }}
              >
                <option value="">— Choose a role —</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            )}
          </div>

          {/* Info cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
            {[
              { icon: '❓', label: '30 Questions', sub: 'Role-specific' },
              { icon: '🤖', label: 'AI Scoring', sub: '0–100 points' },
              { icon: '💡', label: 'Feedback', sub: 'Detailed tips' },
            ].map(({ icon, label, sub }) => (
              <div key={label} style={{
                padding: '16px', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(79,142,247,0.08)', borderRadius: 12,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
              </div>
            ))}
          </div>

          <button
            onClick={startSession}
            disabled={!selectedRole || loadingQs}
            style={{
              width: '100%', padding: '15px',
              background: !selectedRole || loadingQs ? 'rgba(79,142,247,0.3)' : 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700,
              cursor: !selectedRole || loadingQs ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s', fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
            onMouseEnter={e => { if (selectedRole && !loadingQs) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(79,142,247,0.45)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {loadingQs ? (
              <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Generating Questions...</>
            ) : 'Start Interview Session →'}
          </button>
        </div>
      </div>
    </div>
  );

  // ── PRACTICE ──────────────────────────────────────────────────────────────
  if (phase === 'practice') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: 80 }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        {/* Progress */}
        <div style={{ marginBottom: 32, animation: 'fadeIn 0.4s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {selectedRole} — Question {currentQ + 1} of {questions.length}
            </div>
            <button onClick={restart} style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              ← Change Role
            </button>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${((currentQ + 1) / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, #4f8ef7, #7c3aed)',
              borderRadius: 4,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        {/* Question card */}
        <div style={{
          background: 'linear-gradient(145deg, #0d1f3c, #0a1628)',
          border: '1px solid rgba(79,142,247,0.15)',
          borderRadius: 20,
          padding: '36px',
          marginBottom: 20,
          animation: 'slideIn 0.4s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
            <div style={{
              width: 42, height: 42, flexShrink: 0,
              background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
              borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'white',
            }}>Q{currentQ + 1}</div>
            <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6, flex: 1 }}>
              {questions[currentQ]}
            </p>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
              Your Answer
            </label>
            <textarea
              value={answer}
              onChange={e => { setAnswer(e.target.value); setError(''); }}
              placeholder="Write a thorough answer. Explain your reasoning, give examples, and demonstrate your expertise..."
              rows={8}
              style={{
                width: '100%', padding: '16px 18px',
                background: 'rgba(255,255,255,0.04)',
                border: '1.5px solid rgba(79,142,247,0.15)',
                borderRadius: 12, color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)', fontSize: 15,
                resize: 'vertical', outline: 'none',
                lineHeight: 1.7, transition: 'all 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = '#4f8ef7'; e.target.style.boxShadow = '0 0 0 3px rgba(79,142,247,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(79,142,247,0.15)'; e.target.style.boxShadow = 'none'; }}
            />
            <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              {answer.length} characters
            </div>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#fca5a5', fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚠ {error}
            </div>
          )}

          <button
            onClick={submitAnswer}
            disabled={loadingEval || !answer.trim()}
            style={{
              width: '100%', padding: '15px',
              background: loadingEval || !answer.trim() ? 'rgba(79,142,247,0.3)' : 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700,
              cursor: loadingEval || !answer.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s', fontFamily: 'var(--font-body)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            {loadingEval ? (
              <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> AI is evaluating...</>
            ) : 'Submit for AI Evaluation →'}
          </button>
        </div>
      </div>
    </div>
  );

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (phase === 'result' && evaluation) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: 80 }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{selectedRole} — Q{currentQ + 1} Result</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((currentQ + 1) / questions.length) * 100}%`, background: 'linear-gradient(90deg, #4f8ef7, #7c3aed)', borderRadius: 4 }} />
          </div>
        </div>

        {/* Score header */}
        <div style={{
          background: 'linear-gradient(145deg, #0d1f3c, #0a1628)',
          border: '1px solid rgba(79,142,247,0.15)',
          borderRadius: 20,
          padding: '32px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 30,
          flexWrap: 'wrap',
          animation: 'scaleIn 0.4s ease',
        }}>
          <ScoreRing score={evaluation.score} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
              AI Evaluation
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{evaluation.summary}</p>
          </div>
        </div>

        {/* Strengths */}
        {evaluation.strengths?.length > 0 && (
          <div style={{ background: 'linear-gradient(145deg, rgba(16,185,129,0.06), rgba(10,22,40,0.95))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: 24, marginBottom: 16, animation: 'fadeIn 0.5s ease 0.1s both' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#6ee7b7', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              ✓ Strengths
            </h3>
            {evaluation.strengths.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <span style={{ color: '#10b981', flexShrink: 0, marginTop: 1 }}>●</span> {s}
              </div>
            ))}
          </div>
        )}

        {/* Missing Keywords */}
        {evaluation.missingKeywords?.length > 0 && (
          <div style={{ background: 'linear-gradient(145deg, rgba(239,68,68,0.05), rgba(10,22,40,0.95))', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 16, padding: 24, marginBottom: 16, animation: 'fadeIn 0.5s ease 0.2s both' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fca5a5', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚡ Missing Keywords
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {evaluation.missingKeywords.map((k, i) => (
                <span key={i} style={{ padding: '5px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 100, fontSize: 13, fontWeight: 500, color: '#fca5a5' }}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Improvements */}
        {evaluation.improvements?.length > 0 && (
          <div style={{ background: 'linear-gradient(145deg, rgba(245,158,11,0.05), rgba(10,22,40,0.95))', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 16, padding: 24, marginBottom: 16, animation: 'fadeIn 0.5s ease 0.3s both' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fde68a', marginBottom: 14 }}>
              💡 How to Improve
            </h3>
            {evaluation.improvements.map((imp, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <span style={{ color: '#f59e0b', flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span> {imp}
              </div>
            ))}
          </div>
        )}

        {/* Ideal answer hint */}
        {evaluation.idealAnswerHints && (
          <div style={{ background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.18)', borderRadius: 16, padding: 24, marginBottom: 24, animation: 'fadeIn 0.5s ease 0.4s both' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#93c5fd', marginBottom: 10 }}>
              🎯 What an Ideal Answer Includes
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{evaluation.idealAnswerHints}</p>
          </div>
        )}

        <button
          onClick={nextQuestion}
          style={{
            width: '100%', padding: '15px',
            background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
            color: 'white', border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--font-body)', transition: 'all 0.3s',
            boxShadow: '0 6px 20px rgba(79,142,247,0.35)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(79,142,247,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,142,247,0.35)'; }}
        >
          {currentQ + 1 < questions.length ? `Next Question (${currentQ + 2}/${questions.length}) →` : 'View Session Summary →'}
        </button>
      </div>
    </div>
  );

  // ── SUMMARY ────────────────────────────────────────────────────────────────
  if (phase === 'summary') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: 80 }}>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40, animation: 'scaleIn 0.5s ease' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏆</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 10 }}>Session Complete!</h1>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Here's your performance summary for <strong style={{ color: 'var(--text-primary)' }}>{selectedRole}</strong></p>
        </div>

        {/* Overall score */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <ScoreRing score={avgScore} />
        </div>

        {/* Per-question breakdown */}
        <div style={{ marginBottom: 32 }}>
          {allEvals.map((item, i) => (
            <div key={i} style={{
              background: 'linear-gradient(145deg, #0d1f3c, #0a1628)',
              border: '1px solid rgba(79,142,247,0.1)',
              borderRadius: 16, padding: '20px 24px', marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 20,
              animation: `fadeIn 0.4s ease ${i * 0.08}s both`,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                background: item.evaluation.score >= 70 ? 'rgba(16,185,129,0.15)' : item.evaluation.score >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${item.evaluation.score >= 70 ? 'rgba(16,185,129,0.3)' : item.evaluation.score >= 50 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: item.evaluation.score >= 70 ? '#10b981' : item.evaluation.score >= 50 ? '#f59e0b' : '#ef4444' }}>{item.evaluation.score}</span>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Q{i + 1}: {item.question}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.evaluation.summary}</div>
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)', color: item.evaluation.score >= 70 ? '#10b981' : item.evaluation.score >= 50 ? '#f59e0b' : '#ef4444', flexShrink: 0 }}>
                {item.evaluation.grade}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={restart}
          style={{
            width: '100%', padding: '15px',
            background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
            color: 'white', border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--font-body)', transition: 'all 0.3s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          Practice Another Role →
        </button>
      </div>
    </div>
  );

  return null;
}