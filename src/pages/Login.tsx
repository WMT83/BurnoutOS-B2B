import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          <a href="/signup" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Forgot password? Contact <span style={{ color: 'var(--ember)' }}>hello@burnout-os.app</span>
          </a>
        </div>
        <div className="auth-link">New here? <a href="/signup">Start your recovery →</a></div>
      </div>
    </div>
  );
}
