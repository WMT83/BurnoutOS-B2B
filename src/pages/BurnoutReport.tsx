import { useState } from 'react';

const AUDIT_ITEMS = [
  { id: 1, sign: 'Dreading Monday by Thursday evening', dimension: 'Exhaustion' },
  { id: 2, sign: 'Sleep that leaves you unrested', dimension: 'Exhaustion' },
  { id: 3, sign: 'Irritability disproportionate to the trigger', dimension: 'Exhaustion' },
  { id: 4, sign: 'Cynicism about work that wasn\'t there 12 months ago', dimension: 'Cynicism' },
  { id: 5, sign: 'Reduced empathy for colleagues or clients', dimension: 'Cynicism' },
  { id: 6, sign: 'Going through the motions without genuine engagement', dimension: 'Cynicism' },
  { id: 7, sign: 'Doubting whether your effort makes any real difference', dimension: 'Efficacy' },
  { id: 8, sign: 'Procrastination on tasks that once came easily', dimension: 'Efficacy' },
  { id: 9, sign: 'Difficulty concentrating for more than 20 minutes', dimension: 'Efficacy' },
];

export default function BurnoutReport() {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'audit' | 'email' | 'done'>('audit');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function toggle(id: number) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes('@')) { setError('Please enter a valid email address.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await fetch('https://kvsirypfqtnymooxicti.supabase.co/rest/v1/waitlist_signups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2c2lyeXBmcXRueW1vb3hpY3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDM4NzcsImV4cCI6MjA1ODc3OTg3N30.RBjvKB-A-j9e_c5XxFkqT7EKNyFUVpVzlcRvQQT5Dos',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ email, source: 'burnout_report' }),
      });
    } catch (_) { /* non-blocking */ }
    setSubmitting(false);
    setStep('done');
  }

  const count = checked.size;
  const level = count >= 7 ? 'high' : count >= 4 ? 'moderate' : 'low';
  const levelMeta = {
    high: { label: 'High Risk', colour: '#e84b2a', bg: 'rgba(232,75,42,0.1)', border: 'rgba(232,75,42,0.2)' },
    moderate: { label: 'Moderate Risk', colour: '#e8b86d', bg: 'rgba(232,184,109,0.1)', border: 'rgba(232,184,109,0.2)' },
    low: { label: 'Low Risk', colour: '#2a9d5c', bg: 'rgba(42,157,92,0.1)', border: 'rgba(42,157,92,0.2)' },
  }[level];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', fontFamily: 'var(--font-body)', padding: '32px 16px' }}>

      {/* Nav */}
      <div style={{ maxWidth: '680px', margin: '0 auto 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="13" fill="rgba(232,75,42,0.15)" />
            <circle cx="13" cy="13" r="6" fill="var(--ember)" opacity="0.9" />
            <circle cx="13" cy="13" r="3" fill="var(--ember)" />
          </svg>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>BurnoutOS</span>
        </a>
        <a href="/burnout-quiz" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>Take the full quiz →</a>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {step === 'audit' && (
          <>
            <div style={{ marginBottom: '40px' }}>
              <span style={{ display: 'inline-block', padding: '4px 14px', background: 'rgba(232,75,42,0.1)', border: '1px solid rgba(232,75,42,0.2)', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px' }}>
                Free Resource
              </span>
              <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(26px,5vw,40px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.15, marginBottom: '16px' }}>
                Burnout Blindspot Audit
              </h1>
              <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '520px' }}>
                The 9 signs that most people rationalise until they cannot. Tick every one you are currently experiencing — even mildly.
              </p>
            </div>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
              {AUDIT_ITEMS.map(item => {
                const isChecked = checked.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    style={{
                      background: isChecked ? 'rgba(232,75,42,0.08)' : 'var(--surface)',
                      border: `1px solid ${isChecked ? 'rgba(232,75,42,0.35)' : 'var(--border)'}`,
                      borderRadius: '12px',
                      padding: '16px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {/* Checkbox SVG */}
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
                      <rect x="1" y="1" width="20" height="20" rx="6" stroke={isChecked ? 'var(--ember)' : 'rgba(255,255,255,0.15)'} strokeWidth="1.5" fill={isChecked ? 'var(--ember)' : 'transparent'} />
                      {isChecked && <path d="M6 11l3.5 3.5L16 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
                    </svg>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: isChecked ? 'var(--text)' : 'var(--text-muted)', lineHeight: 1.4 }}>{item.sign}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.dimension}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tally */}
            {count > 0 && (
              <div style={{ background: levelMeta.bg, border: `1px solid ${levelMeta.border}`, borderRadius: '12px', padding: '20px 22px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: levelMeta.colour, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{levelMeta.label}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>You identified {count} of 9 signs</div>
                </div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: '36px', fontWeight: 800, color: levelMeta.colour }}>{count}/9</div>
              </div>
            )}

            <button
              onClick={() => count > 0 ? setStep('email') : undefined}
              disabled={count === 0}
              style={{ width: '100%', background: count === 0 ? 'rgba(255,255,255,0.06)' : 'var(--ember)', color: count === 0 ? 'var(--text-muted)' : '#fff', border: 'none', borderRadius: '10px', padding: '16px', fontSize: '15px', fontWeight: 700, cursor: count === 0 ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.2s' }}
            >
              {count === 0 ? 'Select at least one sign to continue' : 'Get my full analysis'}
            </button>
          </>
        )}

        {step === 'email' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px 32px', textAlign: 'center', maxWidth: '480px', margin: '0 auto' }}>
            {/* Score SVG */}
            <svg width="72" height="72" viewBox="0 0 72 72" style={{ marginBottom: '20px' }}>
              <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
              <circle cx="36" cy="36" r="28" fill="none" stroke={levelMeta.colour} strokeWidth="7"
                strokeDasharray={`${(count / 9) * 176} 176`}
                strokeLinecap="round"
                transform="rotate(-90 36 36)" />
              <text x="36" y="41" textAnchor="middle" fill="var(--text)" fontSize="16" fontWeight="700" fontFamily="var(--font-head)">{count}/9</text>
            </svg>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>
              Your full analysis is ready
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '28px' }}>
              Enter your email and we will send your personalised Burnout Blindspot report, along with the evidence-based first steps for your risk level.
            </p>
            <form onSubmit={submit}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '13px 16px', color: 'var(--text)', fontSize: '15px', marginBottom: '12px', fontFamily: 'var(--font-body)' }}
              />
              {error && <p style={{ color: 'var(--ember)', fontSize: '13px', marginBottom: '12px', textAlign: 'left' }}>{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                style={{ width: '100%', background: 'var(--ember)', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, fontFamily: 'var(--font-body)' }}
              >
                {submitting ? 'Sending...' : 'Send my report'}
              </button>
            </form>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '14px', opacity: 0.5 }}>No spam. Unsubscribe anytime.</p>
          </div>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <svg width="56" height="56" viewBox="0 0 56 56" style={{ marginBottom: '20px' }}>
              <circle cx="28" cy="28" r="28" fill="rgba(42,157,92,0.12)" />
              <path d="M18 28l7 7 13-13" stroke="#2a9d5c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '26px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>Report on its way</h2>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto 36px' }}>
              Check your inbox in the next few minutes. In the meantime, explore the programme built for exactly where you are.
            </p>
            <a href="https://app.burnout-os.app/pricing" style={{ display: 'inline-block', background: 'var(--ember)', color: '#fff', textDecoration: 'none', borderRadius: '10px', padding: '14px 32px', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
              See the BurnoutOS programme →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
