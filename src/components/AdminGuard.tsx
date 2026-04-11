import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [status, setStatus] = useState<'loading' | 'admin' | 'denied' | 'unauthenticated'>('loading');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  async function checkAdminAccess() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setStatus('unauthenticated'); return; }

      // user_roles is the single source of truth — not profile text fields
      const { data: roleRow, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) { console.error('AdminGuard role check error:', error); setStatus('denied'); return; }
      setStatus(roleRow ? 'admin' : 'denied');
    } catch (err) {
      console.error('AdminGuard unexpected error:', err);
      setStatus('denied');
    }
  }

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--muted)', fontSize: '14px' }}>
        Verifying access…
      </div>
    );
  }

  if (status === 'unauthenticated') {
    window.location.href = '/login';
    return null;
  }

  if (status === 'denied') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', gap: '12px' }}>
        <div style={{ fontSize: '32px' }}>🚫</div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>Access Denied</div>
        <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Your account does not have admin privileges.</div>
        <button
          onClick={() => supabase.auth.signOut().then(() => { window.location.href = '/login'; })}
          style={{ marginTop: '16px', padding: '8px 20px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', cursor: 'pointer', fontSize: '13px' }}
        >
          Sign Out
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
