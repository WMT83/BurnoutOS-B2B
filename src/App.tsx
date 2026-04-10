import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

import Survey from './pages/Survey';
import BurnoutQuiz from './pages/BurnoutQuiz';
import BurnoutReport from './pages/BurnoutReport';
import Diagnostic from './pages/Diagnostic';
import Admin from './pages/Admin';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Programme from './pages/Programme';

import './index.css';

type AuthState = User | null | undefined;

interface ProfileState {
  access_expires_at: string | null;
  tier: string | null;
}

function ProtectedRoute({
  user, profile, children,
}: {
  user: AuthState;
  profile: ProfileState | null | undefined;
  children: React.ReactNode;
}) {
  // Still loading auth or profile
  if (user === undefined || profile === undefined) {
    return <div className="loading-screen"><div className="spinner" /></div>;
  }
  // Not logged in
  if (!user) return <Navigate to="/login" replace />;
  // Logged in but hasn't paid — show payment recovery page
  if (profile === null || !profile.access_expires_at) {
    return <Navigate to="/complete-payment" replace />;
  }
  return <>{children}</>;
}

function GuestRoute({ user, children }: { user: AuthState; children: React.ReactNode }) {
  if (user === undefined) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// Page shown when user has an account but hasn't completed payment
function CompletePayment({ user }: { user: AuthState }) {
  if (!user) return <Navigate to="/login" replace />;

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/signup';
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480, textAlign: 'center' }}>
        <div className="auth-logo">BurnoutOS</div>
        <div style={{ margin: '24px auto 16px' }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ margin: '0 auto', display: 'block' }}>
            <circle cx="26" cy="26" r="26" fill="rgba(232,75,42,0.1)" />
            <path d="M26 16v14M26 34v2" stroke="#e84b2a" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="auth-title" style={{ fontSize: '20px' }}>Payment not completed</div>
        <div className="auth-sub" style={{ marginTop: '8px' }}>
          Your account has been created but your payment wasn't completed.
          Complete payment to access your BurnoutOS programme.
        </div>
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <a
            href="/signup"
            className="auth-btn"
            style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}
          >
            Complete payment →
          </a>
          <button
            onClick={signOut}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '13px',
              fontFamily: 'inherit', padding: '8px',
            }}
          >
            Sign out and use a different account
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<AuthState>(undefined);
  const [profile, setProfile] = useState<ProfileState | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id);
      else setProfile(null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id);
      else setProfile(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    setProfile(undefined); // loading
    const { data } = await supabase
      .from('user_profiles')
      .select('access_expires_at, tier')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data ?? null);
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public — no auth needed */}
        <Route path="/diagnostic/survey/:token" element={<Survey />} />
        <Route path="/burnout-quiz" element={<BurnoutQuiz />} />
        <Route path="/burnout-report" element={<BurnoutReport />} />
        <Route path="/diagnostic" element={<Diagnostic />} />

        {/* Guest only */}
        <Route path="/signup" element={<GuestRoute user={user}><Signup /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute user={user}><Login /></GuestRoute>} />

        {/* Payment recovery — logged in but not paid */}
        <Route path="/complete-payment" element={<CompletePayment user={user} />} />

        {/* Protected — must be logged in AND paid */}
        <Route path="/dashboard" element={<ProtectedRoute user={user} profile={profile}><Dashboard /></ProtectedRoute>} />
        <Route path="/programme/week/:weekNum" element={<ProtectedRoute user={user} profile={profile}><Programme /></ProtectedRoute>} />

        {/* B2B Admin */}
        <Route path="/diagnostic/admin" element={<Admin />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
