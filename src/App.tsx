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

function GuestRoute({ user, children }: { user: AuthState; children: React.ReactNode }) {
  if (user === undefined) return <div className="loading-screen"><div className="spinner" /></div>;
  // If already logged in, send to the platform dashboard
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

          {/* Guest only — redirect to app if already signed in */}
          <Route path="/signup" element={<GuestRoute user={user}><Signup /></GuestRoute>} />
          <Route path="/login" element={<GuestRoute user={user}><Login /></GuestRoute>} />

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
