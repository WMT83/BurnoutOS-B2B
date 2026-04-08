import { useState } from 'react';

const QUESTIONS = [
  { id: 1, text: 'I feel emotionally drained by my work', category: 'exhaustion' },
  { id: 2, text: 'I feel used up at the end of the working day', category: 'exhaustion' },
  { id: 3, text: 'I feel tired when I get up in the morning and have to face another day', category: 'exhaustion' },
  { id: 4, text: 'I have become less interested in my work since I started', category: 'cynicism' },
  { id: 5, text: 'I have become less enthusiastic about my work', category: 'cynicism' },
  { id: 6, text: 'I doubt the significance of my work', category: 'cynicism' },
  { id: 7, text: 'I feel I am making an effective contribution at work', category: 'efficacy', reversed: true },
  { id: 8, text: 'I can effectively solve the problems that arise in my work', category: 'efficacy', reversed: true },
  { id: 9, text: 'I feel I am positively influencing the lives of others through my work', category: 'efficacy', reversed: true },
];

const LABELS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];

function getResult(score: number) {
  if (score <= 12) return {
    level: 'Low Risk',
    colour: '#2a9d5c',
    bg: 'rgba(42,157,92,0.1)',
    border: 'rgba(42,157,92,0.25)',
    headline: 'You are managing well — stay vigilant.',
    body: 'Your responses suggest your current stress load is within a manageable range. The practices and frameworks in this programme will help you build proactive resilience before depletion sets in.',
    cta: 'Start the programme',
  };
  if (score <= 24) return {
    level: 'Moderate Risk',
    colour: '#e8b86d',
    bg: 'rgba(232,184,109,0.1)',
    border: 'rgba(232,184,109,0.25)',
    headline: 'Early warning signs are present.',
    body: 'Your score suggests meaningful levels of exhaustion or disengagement that deserve attention now. Left unaddressed, moderate burnout typically escalates. This programme is designed precisely for this stage.',
    cta: 'Begin your recovery',
  };
  return {
    level: 'High Risk',
    colour: '#e84b2a',
    bg: 'rgba(232,75,42,0.1)',
    border: 'rgba(232,75,42,0.25)',
    headline: 'You are showing significant burnout indicators.',
    body: 'Your responses indicate substantial depletion across multiple dimensions. This is the point where most people need structured, evidence-based support — not willpower. The BurnoutOS 8-week programme was built for exactly this.',
    cta: 'Get structured support',
  };
}

export default function BurnoutQuiz() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'email' | 'result'>('intro');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const answered = Object.keys(answers).length;
  const totalScore = Object.entries(answers).reduce((sum, [id, val]) => {
    const q = QUESTIONS.find(q => q.id === Number(id));
    return sum + (q?.reversed ? (4 - val) : val);
  }, 0);

  function answer(val: number) {
    const q = QUESTIONS[current];
    setAnswers(prev => ({ ...prev, [q.id]: val }));
    if (current < QUESTIONS.length - 1) {
      setCurrent(c => c + 1);
    } else {
      setStep('email');
    }
  }

  async function submitEmail(e: React.FormEvent) {
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
        body: JSON.stringify({ email, source: 'burnout_quiz' }),
      });
    } catch (_) { /* non-blocking */ }
    setSubmitting(false);
    setStep('result');
  }

  const result = getResult(totalScore);
  const progress = ((current + (step === 'email' || step === 'result' ? 1 : 0)) / QUESTIONS.length) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: 'var(--font-body)' }}>

      {/* Logo */}
      <a href="/" style={{ textDecoration: 'none', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="rgba(232,75,42,0.15)" />
            <circle cx="14" cy="14" r="6" fill="var(--ember)" opacity="0.9" />
            <circle cx="14" cy="14" r="3" fill="var(--ember)" />
          </svg>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>BurnoutOS</span>
        </div>
      </a>

      <div style={{ width: '100%', maxWidth: '560px' }}>

        {/* INTRO */}
        {step === 'intro' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(232,75,42,0.1)', border: '1px solid rgba(232,75,42,0.25)', borderRadius: '20px', fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 600, color: 'var(--ember)', marginBottom: '24px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Free · Takes 3 minutes
            </div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(26px,5vw,38px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2, marginBottom: '16px' }}>
              How burned out are you — really?
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '36px', maxWidth: '460px', margin: '0 auto 36px' }}>
              9 evidence-based questions drawn from the Maslach Burnout Inventory. Get your personalised risk score and a clear picture of where you stand.
            </p>
            <button
              onClick={() => setStep('quiz')}
              style={{ background: 'var(--ember)', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px 36px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)', letterSpacing: '-0.2px' }}
            >
              Start the assessment
            </button>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px', opacity: 0.6 }}>
              Your responses are private. Results delivered immediately.
            </p>
          </div>
        )}

        {/* QUIZ */}
        {step === 'quiz' && (
          <div>
            {/* Progress */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>Question {current + 1} of {QUESTIONS.length}</span>
                <span style={{ fontSize: '12px', color: 'var(--ember)', fontWeight: 600 }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--ember)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* Question */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px 28px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', fontFamily: 'var(--font-body)' }}>
                {QUESTIONS[current].category === 'exhaustion' ? 'Exhaustion' : QUESTIONS[current].category === 'cynicism' ? 'Engagement' : 'Efficacy'}
              </p>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(18px,3vw,22px)', fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, marginBottom: '32px' }}>
                {QUESTIONS[current].text}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {LABELS.map((label, i) => (
                  <button
                    key={i}
                    onClick={() => answer(i)}
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                      fontFamily: 'var(--font-body)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ember)';
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(232,75,42,0.08)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
                    }}
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ember)', fontFamily: 'var(--font-body)' }}>{i}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* EMAIL GATE */}
        {step === 'email' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px 32px' }}>
              {/* Gauge SVG */}
              <svg width="80" height="80" viewBox="0 0 80 80" style={{ marginBottom: '20px' }}>
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="var(--ember)" strokeWidth="8"
                  strokeDasharray={`${(totalScore / 36) * 201} 201`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                  style={{ transition: 'stroke-dasharray 1s ease' }} />
                <text x="40" y="45" textAnchor="middle" fill="var(--text)" fontSize="18" fontWeight="700" fontFamily="var(--font-head)">{totalScore}</text>
              </svg>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '22px', fontWeight: 700, color: 'var(--text)', marginBottom: '10px' }}>
                Your results are ready
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.6 }}>
                Enter your email to see your personalised burnout risk score and what it means for your recovery.
              </p>
              <form onSubmit={submitEmail}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '13px 16px', color: 'var(--text)', fontSize: '15px', marginBottom: '12px', fontFamily: 'var(--font-body)' }}
                />
                {error && <p style={{ color: 'var(--ember)', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ width: '100%', background: 'var(--ember)', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, fontFamily: 'var(--font-body)' }}
                >
                  {submitting ? 'One moment...' : 'See my results'}
                </button>
              </form>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '14px', opacity: 0.5 }}>
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        )}

        {/* RESULT */}
        {step === 'result' && (
          <div>
            {/* Score card */}
            <div style={{ background: result.bg, border: `1px solid ${result.border}`, borderRadius: '16px', padding: '28px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: result.colour, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                Your Burnout Risk
              </div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '32px', fontWeight: 800, color: result.colour, marginBottom: '4px' }}>
                {result.level}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-muted)' }}>
                Score: {totalScore} / 36
              </div>
            </div>

            {/* Interpretation */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
                {result.headline}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.75 }}>
                {result.body}
              </p>
            </div>

            {/* Dimension breakdown */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '18px' }}>
                Dimension Breakdown
              </p>
              {[
                { label: 'Exhaustion', ids: [1,2,3], max: 12 },
                { label: 'Disengagement', ids: [4,5,6], max: 12 },
                { label: 'Reduced Efficacy', ids: [7,8,9], max: 12 },
              ].map(dim => {
                const score = dim.ids.reduce((s, id) => {
                  const q = QUESTIONS.find(q => q.id === id);
                  const val = answers[id] || 0;
                  return s + (q?.reversed ? (4 - val) : val);
                }, 0);
                const pct = (score / dim.max) * 100;
                return (
                  <div key={dim.label} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{dim.label}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>{score}/{dim.max}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct > 66 ? '#e84b2a' : pct > 33 ? '#e8b86d' : '#2a9d5c', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center' }}>
              <a
                href="https://app.burnout-os.app/pricing"
                style={{ display: 'block', background: 'var(--ember)', color: '#fff', textDecoration: 'none', borderRadius: '10px', padding: '16px', fontSize: '15px', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-body)' }}
              >
                {result.cta} →
              </a>
              <a
                href="/diagnostic"
                style={{ display: 'block', background: 'var(--surface)', color: 'var(--text-muted)', textDecoration: 'none', borderRadius: '10px', padding: '14px', fontSize: '14px', border: '1px solid var(--border)', fontFamily: 'var(--font-body)' }}
              >
                Book a free Burnout Diagnostic call instead
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
