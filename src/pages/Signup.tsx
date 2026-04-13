import { useState } from 'react';
import { supabase } from '../lib/supabase';

// Stripe payment links — success URL must be set to:
// https://app.burnout-os.app/dashboard?upgrade=success  (set in Stripe dashboard per link)
const PAYMENT_LINKS: Record<string, Record<string, string>> = {
  on_demand: {
    au: 'https://buy.stripe.com/28EaEXh1dcw2b4y9zMdnW02',  // AUD $697
    za: 'https://buy.stripe.com/14A28r5iv8fMfkOeU6dnW03',  // ZAR R7,997
    gb: 'https://buy.stripe.com/28EeVddP1brYa0ufYadnW04',  // GBP £397
  },
  intensive: {
    au: 'https://buy.stripe.com/dRm3cvaCP1Ro7Sm9zMdnW08',  // AUD $1,497
    za: 'https://buy.stripe.com/fZudR97qDfIedcG7rEdnW09',  // ZAR R16,997
    gb: 'https://buy.stripe.com/bJe4gz8uHanUgoSeU6dnW0a',  // GBP £847
  },
};

const REGION_OPTIONS = [
  { value: 'au', label: 'Australia' },
  { value: 'za', label: 'South Africa' },
  { value: 'gb', label: 'United Kingdom' },
];

const TIER_OPTIONS = [
  { value: 'on_demand', label: 'Self-Guided — AUD $697 / ZAR R7,997 / GBP £397' },
  { value: 'intensive', label: 'Burnout Recovery Intensive — AUD $1,497 / ZAR R16,997 / GBP £847' },
];

export default function Signup() {
  // Read pre-selected tier/region from URL params (e.g. from intensive.html)
  const params = new URLSearchParams(window.location.search);
  const defaultTier = params.get('tier') === 'intensive' ? 'intensive' : 'on_demand';
  const defaultRegion = ['au', 'za', 'gb'].includes(params.get('region') ?? '') ? params.get('region')! : 'au';

  const [step, setStep]         = useState<'details' | 'processing'>('details');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [region, setRegion]     = useState(defaultRegion);
  const [tier, setTier]         = useState(defaultTier);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create Supabase account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Signup failed — please try again.');

      // Get the session tokens to pass to the app domain.
      // We're on www.burnout-os.app but the app is on app.burnout-os.app —
      // different subdomains don't share cookies, so we hand off the session
      // via URL params to app.burnout-os.app which will establish it there,
      // then redirect the user to Stripe checkout.
      const session = authData.session;
      if (!session) throw new Error('Session not established — please try again.');

      const paymentLink = PAYMENT_LINKS[tier]?.[region] || PAYMENT_LINKS['on_demand']['au'];
      const checkoutUrl = `${paymentLink}?prefilled_email=${encodeURIComponent(email)}&client_reference_id=${authData.user.id}`;

      // Redirect to app domain with session + checkout URL encoded
      // App domain picks up the session, sets cookies, then forwards to Stripe
      const handoffUrl = `https://app.burnout-os.app/auth?access_token=${session.access_token}&refresh_token=${session.refresh_token}&type=signup&next=${encodeURIComponent(checkoutUrl)}`;

      setStep('processing');
      setTimeout(() => {
        window.location.href = handoffUrl;
      }, 400);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      if (message.toLowerCase().includes('already registered') || message.toLowerCase().includes('already exists')) {
        setError('An account with this email already exists. Sign in at app.burnout-os.app/auth');
      } else {
        setError(message);
      }
      setLoading(false);
    }
  }

  if (step === 'processing') {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 24px' }} />
          <div className="auth-title" style={{ fontSize: '22px' }}>Redirecting to secure checkout…</div>
          <div className="auth-sub">You'll be back in moments to start your recovery.</div>
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
            <label>FULL NAME</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="auth-field">
            <label>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="auth-field">
            <label>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>
          <div className="auth-field">
            <label>PROGRAMME</label>
            <select value={tier} onChange={e => setTier(e.target.value)}>
              {TIER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="auth-field">
            <label>REGION</label>
            <select value={region} onChange={e => setRegion(e.target.value)}>
              {REGION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Continue to payment →'}
          </button>
        </form>

        <div style={{ margin: '20px 0', background: 'var(--surface-2)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            ✓ Immediate access upon payment<br />
            ✓ 30-day satisfaction commitment<br />
            ✓ Secure payment via Stripe
          </div>
        </div>

        <div className="auth-link">
          Already have an account?{' '}
          <a href="https://app.burnout-os.app/auth">Sign in →</a>
        </div>
      </div>
    </div>
  );
}
