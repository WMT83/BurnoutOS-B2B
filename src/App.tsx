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
import Onboarding from './pages/Onboarding';

import './index.css';

// undefined = loading, null = not authenticated, User = authenticated
type AuthState = User | null | undefined;

function ProtectedRoute({ user, children }: { user: AuthState; children: React.ReactNode }) {
  if (user === undefined) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ user, children }: { user: AuthState; children: React.ReactNode }) {
  if (user === undefined) return <div className="loading-screen"><div className="spinner" /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
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
      <Routes>
        {/* Public — no auth needed */}
        <Route path="/diagnostic/survey/:token" element={<Survey />} />

        {/* Guest only — redirect to dashboard if already signed in */}
        <Route path="/signup" element={<GuestRoute user={user}><Signup /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute user={user}><Login /></GuestRoute>} />

        {/* Protected — redirect to login if not signed in */}
        <Route path="/onboarding" element={<ProtectedRoute user={user}><Onboarding /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
        <Route path="/programme/week/:weekNum" element={<ProtectedRoute user={user}><Programme /></ProtectedRoute>} />

        {/* B2B Admin — no auth guard (Werner accesses directly) */}
        <Route path="/diagnostic/admin" element={<Admin />} />

        {/* HVCO public routes */}
        <Route path="/burnout-quiz" element={<BurnoutQuiz />} />
        <Route path="/burnout-report" element={<BurnoutReport />} />
        <Route path="/diagnostic" element={<Diagnostic />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
