import { useState, useEffect, useRef } from 'react';

// ── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

// ── Burnout cost model (mirrors edge function) ───────────────────────────────
const ANNUAL_SALARY = 90_000;
const RISK_PCT: Record<string, number> = { low: 0.08, moderate: 0.18, high: 0.28, critical: 0.40 };
const RISK_LABELS: Record<string, { label: string; colour: string; bg: string }> = {
  low:      { label: 'Low Risk',      colour: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  moderate: { label: 'Moderate Risk', colour: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  high:     { label: 'High Risk',     colour: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  critical: { label: 'Critical',      colour: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

function getRisk(score: number): string {
  if (score >= 8) return 'critical';
  if (score >= 6) return 'high';
  if (score >= 4) return 'moderate';
  return 'low';
}

// ── Format currency ──────────────────────────────────────────────────────────
function fmtAUD(n: number) {
  if (n >= 1_000_000) return `AUD ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `AUD ${(n / 1_000).toFixed(0)}K`;
  return `AUD ${n.toLocaleString()}`;
}

export default function Landing() {
  // Calculator state
  const [employees, setEmployees] = useState(200);
  const [burnoutScore, setBurnoutScore] = useState(5);
  const [calcVisible, setCalcVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const calcRef = useRef<HTMLDivElement>(null);

  const risk = getRisk(burnoutScore);
  const riskInfo = RISK_LABELS[risk];
  const affectedPct = RISK_PCT[risk];
  const annualCost = Math.round(employees * affectedPct * ANNUAL_SALARY * 0.34);
  const diagnosticFee = 9_500;
  const roiMultiple = annualCost > 0 ? Math.round(annualCost / diagnosticFee) : 0;

  const animatedCost = useCountUp(resultVisible ? annualCost : 0, 1400, resultVisible);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCalcVisible(true); },
      { threshold: 0.3 }
    );
    if (calcRef.current) obs.observe(calcRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (calcVisible) setTimeout(() => setResultVisible(true), 400);
  }, [calcVisible, employees, burnoutScore]);

  useEffect(() => {
    setResultVisible(false);
    const t = setTimeout(() => setResultVisible(true), 300);
    return () => clearTimeout(t);
  }, [employees, burnoutScore]);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: '#080f1e', color: '#e8edf5', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');

        * { box-sizing: border-box; }

        ::selection { background: rgba(0,196,167,0.3); }

        .nav-link { color: rgba(232,237,245,0.55); font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.2s; letter-spacing: 0.01em; }
        .nav-link:hover { color: #e8edf5; }

        .btn-cta {
          background: #00c4a7; color: #080f1e; font-family: 'DM Sans', sans-serif;
          font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 10px;
          border: none; cursor: pointer; transition: all 0.2s; letter-spacing: -0.01em;
        }
        .btn-cta:hover { background: #00dbbe; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,196,167,0.3); }

        .btn-ghost {
          background: transparent; color: rgba(232,237,245,0.7); font-family: 'DM Sans', sans-serif;
          font-weight: 500; font-size: 14px; padding: 12px 22px; border-radius: 10px;
          border: 1px solid rgba(232,237,245,0.12); cursor: pointer; transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: rgba(232,237,245,0.3); color: #e8edf5; }

        .stat-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 28px; transition: border-color 0.2s;
        }
        .stat-card:hover { border-color: rgba(0,196,167,0.25); }

        .slider-track { position: relative; height: 6px; background: rgba(255,255,255,0.1); border-radius: 99px; }
        input[type=range] {
          width: 100%; -webkit-appearance: none; appearance: none;
          height: 6px; border-radius: 99px; outline: none; cursor: pointer;
          background: transparent; position: relative; z-index: 2;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
          background: #00c4a7; border: 3px solid #080f1e;
          box-shadow: 0 0 0 2px #00c4a7; cursor: grab; transition: transform 0.15s;
        }
        input[type=range]::-webkit-slider-thumb:active { cursor: grabbing; transform: scale(1.2); }
        input[type=range]::-webkit-slider-runnable-track { height: 6px; border-radius: 99px; }

        .step-number {
          width: 36px; height: 36px; border-radius: 50%; background: rgba(0,196,167,0.12);
          border: 1px solid rgba(0,196,167,0.3); display: flex; align-items: center;
          justify-content: center; font-size: 13px; font-weight: 700; color: #00c4a7;
          flex-shrink: 0; font-family: 'DM Mono', monospace;
        }

        .fade-in { animation: fadeUp 0.6s ease both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .cost-counter {
          font-family: 'DM Mono', monospace; font-size: clamp(36px, 6vw, 64px);
          font-weight: 500; color: #00c4a7; letter-spacing: -0.03em;
          transition: opacity 0.3s;
        }

        .grid-bg {
          background-image:
            linear-gradient(rgba(0,196,167,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,196,167,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .tag { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }

        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Navigation ───────────────────────────────────────────────────────── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,15,30,0.85)', backdropFilter: 'blur(16px)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,196,167,0.15)', border: '1px solid rgba(0,196,167,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#00c4a7', fontWeight: 800, fontSize: 14, fontFamily: 'DM Mono, monospace' }}>B</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Burnout OS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#calculator" className="nav-link">Calculator</a>
          <a href="#how-it-works" className="nav-link">How it works</a>
          <a href="mailto:hello@burnout-os.app" className="nav-link">Contact</a>
          <a href="/diagnostic/admin">
            <button className="btn-cta" style={{ padding: '9px 18px', fontSize: 13 }}>Admin →</button>
          </a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="grid-bg" style={{ padding: '100px 32px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div className="tag fade-in" style={{ background: 'rgba(0,196,167,0.1)', color: '#00c4a7', border: '1px solid rgba(0,196,167,0.2)', marginBottom: 28, animationDelay: '0s' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00c4a7', display: 'inline-block' }} />
            Organisational Burnout Diagnostic
          </div>

          <h1 className="fade-in" style={{ fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.04em', marginBottom: 24, animationDelay: '0.1s', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>
            Burnout is costing your<br />
            <span style={{ color: '#00c4a7' }}>organisation more</span><br />
            than you realise.
          </h1>

          <p className="fade-in" style={{ fontSize: 18, color: 'rgba(232,237,245,0.6)', lineHeight: 1.7, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px', animationDelay: '0.2s', fontWeight: 300 }}>
            We quantify the exact cost of burnout in your workforce — then give you a clinician-designed platform to fix it. Diagnostic engagement from AUD 9,500.
          </p>

          <div className="fade-in" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s' }}>
            <a href="#calculator"><button className="btn-cta">Calculate your burnout cost →</button></a>
            <a href="mailto:hello@burnout-os.app"><button className="btn-ghost">Book a discovery call</button></a>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '40px 32px' }}>
        <div className="stats-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {[
            { value: '34%', label: 'of annual salary lost per burned-out employee', source: 'Gallup 2024' },
            { value: '$97K', label: 'average cost to replace a burned-out employee', source: 'SHRM Research' },
            { value: '76%', label: 'of Australian workers report burnout symptoms', source: 'Safe Work Australia' },
            { value: '6 mo', label: 'warning window before burnout becomes attrition', source: 'Maslach Institute' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '20px 32px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 28, fontWeight: 500, color: '#00c4a7', letterSpacing: '-0.03em', marginBottom: 6 }}>{s.value}</p>
              <p style={{ fontSize: 13, color: 'rgba(232,237,245,0.5)', lineHeight: 1.5, marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: 11, color: 'rgba(232,237,245,0.25)', fontFamily: 'DM Mono, monospace' }}>{s.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Calculator ───────────────────────────────────────────────────────── */}
      <section id="calculator" ref={calcRef} style={{ padding: '100px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#00c4a7', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Burnout Cost Calculator</p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>
            What is burnout costing your organisation?
          </h2>
        </div>

        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>

          {/* Inputs */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '36px 32px' }}>
            {/* Employees */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: 'rgba(232,237,245,0.7)' }}>Number of employees</label>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 22, fontWeight: 500, color: '#e8edf5' }}>{employees.toLocaleString()}</span>
              </div>
              <input type="range" min={10} max={5000} step={10} value={employees}
                onChange={e => setEmployees(Number(e.target.value))}
                style={{ background: `linear-gradient(to right, #00c4a7 ${((employees - 10) / 4990) * 100}%, rgba(255,255,255,0.1) ${((employees - 10) / 4990) * 100}%)` }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: 'rgba(232,237,245,0.25)', fontFamily: 'DM Mono, monospace' }}>10</span>
                <span style={{ fontSize: 11, color: 'rgba(232,237,245,0.25)', fontFamily: 'DM Mono, monospace' }}>5,000</span>
              </div>
            </div>

            {/* Burnout score */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: 'rgba(232,237,245,0.7)' }}>Perceived burnout severity</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 22, fontWeight: 500 }}>{burnoutScore}<span style={{ fontSize: 13, color: 'rgba(232,237,245,0.4)' }}>/10</span></span>
                </div>
              </div>
              <input type="range" min={1} max={10} step={0.5} value={burnoutScore}
                onChange={e => setBurnoutScore(Number(e.target.value))}
                style={{ background: `linear-gradient(to right, #00c4a7 ${((burnoutScore - 1) / 9) * 100}%, rgba(255,255,255,0.1) ${((burnoutScore - 1) / 9) * 100}%)` }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: 'rgba(232,237,245,0.25)', fontFamily: 'DM Mono, monospace' }}>1 — Healthy</span>
                <span style={{ fontSize: 11, color: 'rgba(232,237,245,0.25)', fontFamily: 'DM Mono, monospace' }}>10 — Critical</span>
              </div>
            </div>

            <div style={{ marginTop: 32, padding: '16px 20px', borderRadius: 12, background: riskInfo.bg, border: `1px solid ${riskInfo.colour}33` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: riskInfo.colour, flexShrink: 0 }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: riskInfo.colour }}>{riskInfo.label}</p>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(232,237,245,0.45)', marginTop: 4, lineHeight: 1.5 }}>
                {risk === 'low' && 'Early indicators present. Prevention now is far cheaper than recovery.'}
                {risk === 'moderate' && 'Measurable productivity loss. Absenteeism likely elevated. Act within 90 days.'}
                {risk === 'high' && 'Significant attrition risk. Multiple high performers likely considering exit.'}
                {risk === 'critical' && 'Acute organisational burnout. Immediate intervention required.'}
              </p>
            </div>
          </div>

          {/* Result */}
          <div style={{ background: 'rgba(0,196,167,0.04)', border: '1px solid rgba(0,196,167,0.15)', borderRadius: 20, padding: '36px 32px' }}>
            <p style={{ fontSize: 12, fontFamily: 'DM Mono, monospace', color: 'rgba(0,196,167,0.7)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Estimated annual cost</p>
            <div className="cost-counter" style={{ opacity: resultVisible ? 1 : 0 }}>
              {fmtAUD(animatedCost)}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(232,237,245,0.4)', marginTop: 8, fontFamily: 'DM Mono, monospace' }}>
              ≈ {Math.round(employees * RISK_PCT[risk])} employees affected · {(RISK_PCT[risk] * 100).toFixed(0)}% of workforce
            </p>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '28px 0' }} />

            {/* ROI breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Productivity loss (34%)', value: fmtAUD(Math.round(employees * RISK_PCT[risk] * ANNUAL_SALARY * 0.34 * 0.6)) },
                { label: 'Absenteeism cost', value: fmtAUD(Math.round(employees * RISK_PCT[risk] * ANNUAL_SALARY * 0.34 * 0.2)) },
                { label: 'Turnover & replacement', value: fmtAUD(Math.round(employees * RISK_PCT[risk] * ANNUAL_SALARY * 0.34 * 0.2)) },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'rgba(232,237,245,0.45)' }}>{item.label}</span>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: 'rgba(232,237,245,0.7)' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '24px 0' }} />

            <div style={{ background: 'rgba(0,196,167,0.08)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'rgba(232,237,245,0.6)' }}>Diagnostic engagement</span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13 }}>AUD 9,500</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>ROI of diagnostic</span>
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 18, fontWeight: 500, color: '#00c4a7' }}>
                  {roiMultiple > 0 ? `${roiMultiple}×` : '—'}
                </span>
              </div>
            </div>

            <a href="mailto:hello@burnout-os.app?subject=Burnout Diagnostic Enquiry">
              <button className="btn-cta" style={{ width: '100%', padding: '14px', fontSize: 15 }}>
                Get a precise diagnostic → AUD 9,500
              </button>
            </a>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(232,237,245,0.3)', marginTop: 10 }}>
              Includes full workforce survey, scored report, and 90-min debrief with a registered Clinical Psychologist.
            </p>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '80px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#00c4a7', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>The Process</p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic' }}>
              From diagnostic to platform in 4 weeks.
            </h2>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { n: '01', title: 'Engagement', body: 'AUD 9,500 diagnostic engagement. We issue a survey token to your team. No software to install — employees complete it in 5 minutes via any browser.' },
              { n: '02', title: 'Survey', body: '35 validated questions across 7 burnout dimensions — workload, autonomy, recognition, community, fairness, values, and direct symptom screening.' },
              { n: '03', title: 'Report', body: 'Clinician-scored results. Dimension breakdown, risk level per team, estimated cost in AUD, and prioritised recommendations. Delivered in 5 business days.' },
              { n: '04', title: 'Platform', body: 'Convert to an annual platform subscription from AUD 6.50 PEPM. Full workforce access to the clinician-designed burnout recovery programme.' },
            ].map(s => (
              <div key={s.n} className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div className="step-number">{s.n}</div>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'rgba(232,237,245,0.5)', lineHeight: 1.65 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 32px', textAlign: 'center', background: 'rgba(0,196,167,0.04)', borderTop: '1px solid rgba(0,196,167,0.1)' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#00c4a7', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>Ready to quantify it?</p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 20, fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic', lineHeight: 1.1 }}>
            Know the number.<br />Then fix it.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(232,237,245,0.5)', marginBottom: 36, lineHeight: 1.6 }}>
            The diagnostic engagement pays for itself before the report lands. Contact us to scope your organisation's assessment.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="mailto:hello@burnout-os.app?subject=Burnout Diagnostic Enquiry">
              <button className="btn-cta">Book a discovery call</button>
            </a>
            <a href="#calculator"><button className="btn-ghost">Recalculate →</button></a>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em' }}>Burnout OS</span>
          <span style={{ color: 'rgba(232,237,245,0.2)', fontSize: 12 }}>·</span>
          <span style={{ fontSize: 12, color: 'rgba(232,237,245,0.3)' }}>by Katalis Health</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="mailto:hello@burnout-os.app" style={{ fontSize: 13, color: 'rgba(232,237,245,0.3)', textDecoration: 'none' }}>hello@burnout-os.app</a>
          <span style={{ fontSize: 13, color: 'rgba(232,237,245,0.2)' }}>© 2026 Behavioural Health Pty Ltd</span>
        </div>
      </footer>
    </div>
  );
}
