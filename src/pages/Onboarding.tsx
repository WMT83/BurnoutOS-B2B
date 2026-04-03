import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const DURATION_OPTIONS = ['Less than 3 months', '3–6 months', '6–12 months', 'Over a year'];
const ROLE_OPTIONS = ['Individual contributor', 'Team lead / Manager', 'Senior leader / Executive', 'Business owner', 'Other'];
const GOAL_OPTIONS = ['Reduce exhaustion', 'Rebuild motivation', 'Improve sleep', 'Set better boundaries', 'Reconnect with purpose'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [duration, setDuration] = useState('');
  const [role, setRole] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  function toggleGoal(g: string) {
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  }

  async function finish() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_profiles').upsert({
        id: user.id,
        burnout_duration: duration,
        job_role: role,
        onboarding_completed: true,
        current_week: 1,
        tier: 'on_demand',
      });
    }
    navigate('/dashboard');
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        {step === 1 && (
          <>
            <div className="onboarding-step">Step 1 of 3</div>
            <div className="onboarding-title">Welcome to BurnoutOS.</div>
            <div className="onboarding-sub">A few quick questions to personalise your programme. Takes less than 2 minutes.</div>
            <div style={{ marginBottom: 12, fontSize: 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>How long have you been experiencing burnout?</div>
            <div className="option-grid">
              {DURATION_OPTIONS.map(o => (
                <button key={o} className={`option-btn ${duration === o ? 'selected' : ''}`} onClick={() => setDuration(o)}>{o}</button>
              ))}
            </div>
            <button className="next-btn" disabled={!duration} onClick={() => setStep(2)}>Next →</button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="onboarding-step">Step 2 of 3</div>
            <div className="onboarding-title">What describes your role?</div>
            <div className="onboarding-sub">This helps us emphasise the practices most relevant to your context.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {ROLE_OPTIONS.map(o => (
                <button key={o} className={`option-btn ${role === o ? 'selected' : ''}`} onClick={() => setRole(o)}>{o}</button>
              ))}
            </div>
            <button className="next-btn" disabled={!role} onClick={() => setStep(3)}>Next →</button>
          </>
        )}
        {step === 3 && (
          <>
            <div className="onboarding-step">Step 3 of 3</div>
            <div className="onboarding-title">What matters most to you?</div>
            <div className="onboarding-sub">Select up to three recovery goals. These guide your programme emphasis.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {GOAL_OPTIONS.map(o => (
                <button key={o} className={`option-btn ${goals.includes(o) ? 'selected' : ''}`}
                  onClick={() => toggleGoal(o)}
                  disabled={!goals.includes(o) && goals.length >= 3}>{o}</button>
              ))}
            </div>
            <button className="next-btn" disabled={goals.length === 0 || saving} onClick={finish}>
              {saving ? 'Setting up your programme…' : 'Start my programme →'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
