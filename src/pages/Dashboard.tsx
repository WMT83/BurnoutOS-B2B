import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const WEEKS = [
  { week: 1, title: 'The Neuroscience of Burnout', focus: 'Why your brain got here — and what it takes to heal', free: true },
  { week: 2, title: 'Trying Harder Is Making It Worse', focus: 'The exhaustion trap keeping high performers stuck' },
  { week: 3, title: 'How to Stop the 3am Spiral', focus: 'Breaking the rumination loop that steals your rest' },
  { week: 4, title: 'How to Reset Your Sleep', focus: 'The science of nervous system recovery after burnout' },
  { week: 5, title: 'Pivoting Towards Meaning in Work', focus: 'Values-based recovery when everything feels pointless' },
  { week: 6, title: 'Effectively Managing Boundaries in Relationships', focus: 'Setting and maintaining boundaries without guilt' },
  { week: 7, title: 'Sustainable Performance in the Long Run', focus: 'Building lasting energy and performance after depletion' },
  { week: 8, title: 'Your Personalised Relapse Prevention Plan', focus: 'Your evidence-based long-term protection plan' },
];

interface Profile {
  full_name: string | null;
  current_week: number;
  tier: string;
  access_expires_at: string | null;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: p } = await supabase
        .from('user_profiles')
        .select('full_name, current_week, tier, access_expires_at')
        .eq('id', user.id)
        .single();

      const { data: completions } = await supabase
        .from('module_completions')
        .select('module_id, modules(week)')
        .eq('user_id', user.id);

      setProfile(p);
      const weeks = (completions || []).map((c: any) => c.modules?.week).filter(Boolean);
      setCompletedWeeks(weeks);
      setLoading(false);
    }
    load();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  const hasPaidAccess = profile?.tier && profile.tier !== 'free';
  const currentWeek = profile?.current_week || 1;
  const progressPct = Math.round((completedWeeks.length / 8) * 100);
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">BurnoutOS</div>
        <nav className="sidebar-nav">
          <a href="/dashboard" className="sidebar-link active">⬡ Dashboard</a>
          <a href={`/programme/week/${currentWeek}`} className="sidebar-link">◎ Programme</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-user">{profile?.full_name || 'Your account'}</div>
          <button className="signout-btn" onClick={signOut}>Sign out</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="page-header">
          <div className="page-title">Good to see you, {firstName}.</div>
          <div className="page-sub">Your 8-week recovery programme.</div>
        </div>

        {!hasPaidAccess && (
          <div className="card" style={{ marginBottom: 28, borderColor: 'rgba(232,75,42,0.4)', background: 'rgba(232,75,42,0.06)' }}>
            <div className="card-title" style={{ color: 'var(--ember)' }}>Week 1 is unlocked — full access awaits</div>
            <div className="card-body" style={{ marginBottom: 16 }}>
              Complete payment to unlock all 8 weeks, the AI recovery coach, and lifetime access.
            </div>
            <a href="/signup" style={{ display: 'inline-block', background: 'var(--ember)', color: 'white', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
              Unlock full programme →
            </a>
          </div>
        )}

        <div className="card-grid card-grid-3" style={{ marginBottom: 32 }}>
          <div className="card">
            <div className="card-label">Current week</div>
            <div className="card-value">{currentWeek}</div>
          </div>
          <div className="card">
            <div className="card-label">Weeks completed</div>
            <div className="card-value">{completedWeeks.length}</div>
          </div>
          <div className="card">
            <div className="card-label">Progress</div>
            <div className="card-value">{progressPct}%</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        <div className="card-title" style={{ marginBottom: 20 }}>Your 8-week programme</div>
        <div className="week-grid">
          {WEEKS.map(w => {
            const isCompleted = completedWeeks.includes(w.week);
            const isCurrent = w.week === currentWeek;
            const isLocked = !hasPaidAccess && !w.free && w.week > 1;
            return (
              <a
                key={w.week}
                href={isLocked ? undefined : `/programme/week/${w.week}`}
                className={`week-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''} ${isCurrent && !isCompleted ? 'current' : ''}`}
              >
                {isCompleted && <span className="week-badge done">✓</span>}
                {isCurrent && !isCompleted && <span className="week-badge now">→</span>}
                {isLocked && <span className="week-badge" style={{ color: 'var(--text-muted)' }}>🔒</span>}
                <div className="week-num">Week {w.week}</div>
                <div className="week-title">{w.title}</div>
                <div className="week-focus">{w.focus}</div>
              </a>
            );
          })}
        </div>
      </main>
    </div>
  );
}
