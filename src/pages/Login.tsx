import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [resetSent, setResetSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
    // App.tsx auth state listener redirects to /dashboard on success
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/dashboard?welcome=1`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setResetSent(true);
    }
  }

  // ── Password reset sent state ─────────────────────────────────────────────
  if (resetSent) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-logo">BurnoutOS</div>
          <div style={{ margin: '24px auto 16px' }}>
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ margin: '0 auto' }}>
              <circle cx="26" cy="26" r="26" fill="rgba(42,157,92,0.12)" />
              <path d="M16 26l7 7 13-13" stroke="#2a9d5c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div className="auth-title" style={{ fontSize: '20px' }}>Check your inbox</div>
          <div className="auth-sub" style={{ marginTop: '8px' }}>
            We sent a password reset link to <strong style={{ color: 'var(--text)' }}>{email}</strong>.<br />
            Click the link in the email to set a new password.
          </div>
          <div style={{ marginTop: '24px' }}>
            <button
              className="auth-btn"
              style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', fontSize: '14px' }}
              onClick={() => { setMode('login'); setResetSent(false); }}
            >
              Back to sign in
            </button>
          </div>
          <div className="auth-link" style={{ marginTop: '16px', fontSize: '12px', opacity: 0.5 }}>
            Didn't receive it? Check your spam folder or contact <a href="mailto:hello@burnout-os.app">hello@burnout-os.app</a>
          </div>
        </div>
      </div>
    );
  }

  // ── Password reset form ───────────────────────────────────────────────────
  if (mode === 'reset') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">BurnoutOS</div>
          <div className="auth-title">Reset your password</div>
          <div className="auth-sub">Enter your email and we'll send you a reset link.</div>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleReset}>
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>
            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
          <div className="auth-link" style={{ marginTop: '16px' }}>
            <button
              onClick={() => { setMode('login'); setError(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ember)', fontSize: '14px', fontFamily: 'inherit' }}
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Login form ────────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">BurnoutOS</div>
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Sign in to continue your recovery programme.</div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="auth-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" required />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="auth-link" style={{ marginTop: '16px' }}>
          <button
            onClick={() => { setMode('reset'); setError(''); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ember)', fontSize: '14px', fontFamily: 'inherit' }}
          >
            Forgot your password?
          </button>
        </div>
        <div className="auth-link">New here? <a href="/signup">Start your recovery →</a></div>
      </div>
    </div>
  );
}
