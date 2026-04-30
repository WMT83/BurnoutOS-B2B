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
import AdminGuard from './components/AdminGuard';
import { ErrorBoundary } from './components/ErrorBoundary';

import './index.css';

type AuthState = User | null | undefined;

// Login page only — sends already-signed-in users to the platform.
// Signup is intentionally NOT guarded: a returning customer purchasing a new
// programme tier (e.g. upgrading Self-Guided -> Intensive, or buying a gift)
// must be able to reach the signup form even if they have a session, otherwise
// they get bounced into a /dashboard -> /auth loop on the platform domain
// (cookie scope is per-subdomain, so the session does not carry across).
function LoginGuard({ user, children }: { user: AuthState; children: React.ReactNode }) {
  if (user === undefined) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user) {
    window.location.href = 'https://app.burnout-os.app/dashboard';
    return null;
  }
  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<AuthState>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary context="App">
        <Routes>
          {/* Public — no auth needed */}
          <Route path="/diagnostic/survey/:token" element={<Survey />} />
          <Route path="/burnout-quiz" element={<BurnoutQuiz />} />
          <Route path="/burnout-report" element={<BurnoutReport />} />
          <Route path="/diagnostic" element={<Diagnostic />} />

          {/* Signup is open: returning customers must be able to purchase
              additional tiers without being bounced into a dashboard loop.
              Signup.tsx already handles the "email already exists" case
              with a clear message pointing to /auth for sign-in. */}
          <Route path="/signup" element={<Signup />} />

          {/* Login bounces signed-in users to the platform dashboard */}
          <Route path="/login" element={<LoginGuard user={user}><Login /></LoginGuard>} />

          {/* B2B Admin — protected */}
          <Route path="/diagnostic/admin" element={
            <AdminGuard>
              <ErrorBoundary context="Admin">
                <Admin />
              </ErrorBoundary>
            </AdminGuard>
          } />

          {/* Fallback → login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
