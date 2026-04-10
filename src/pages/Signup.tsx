import { useState } from 'react';
import { supabase } from '../lib/supabase';

const REGION_OPTIONS = [
  { value: 'au', label: 'Australia (AUD 697)' },
  { value: 'za', label: 'South Africa (ZAR 7,997)' },
  { value: 'gb', label: 'United Kingdom (GBP £397)' },
];

export default function Signup() {
  const [step, setStep] = useState<'details' | 'processing'>('details');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [region, setRegion] = useState('au');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Signup failed — please try again.');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-b2c-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ user_id: authData.user.id, email, region, full_name: fullName }),
        }
      );
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setStep('processing');
      window.location.href = json.checkout_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (step === 'processing') {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 24px' }} />
          <div className="auth-title" style={{ fontSize: '22px' }}>Redirecting to checkout…</div>
          <div className="auth-sub">You will be back in moments to start your recovery.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">BurnoutOS</div>
        <div className="auth-title">Start your recovery</div>
        <div className="auth-sub">8-week evidence-based programme. One-time payment. Ongoing access.</div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSignup}>
          <div className="auth-field">
            <label>Full name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" required />
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} required />
          </div>
          <div className="auth-field">
            <label>Region</label>
            <select value={region} onChange={e => setRegion(e.target.value)}>
              {REGION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Continue to payment →'}
          </button>
        </form>
        <div style={{ margin: '20px 0', background: 'var(--surface-2)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            ✓ 30-day satisfaction commitment<br />
            ✓ Secure payment via Stripe<br />
            ✓ Immediate access upon payment
          </div>
        </div>
        <div className="auth-link">Already have an account? <a href="/login">Sign in</a></div>
      </div>
    </div>
  );
}
