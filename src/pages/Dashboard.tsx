import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const WEEKS = [
  { week: 1, title: 'The Neuroscience of Burnout', focus: 'Why your brain got here — and what it takes to heal' },
  { week: 2, title: 'Trying Harder Is Making It Worse', focus: 'The exhaustion trap keeping high performers stuck' },
  { week: 3, title: 'How to Stop the 3am Spiral', focus: 'Breaking the rumination loop that steals your rest' },
  { week: 4, title: 'How to Reset Your Sleep', focus: 'The science of nervous system recovery after burnout' },
  { week: 5, title: 'Pivoting Towards Meaning in Work', focus: 'Values-based recovery when everything feels pointless' },
  { week: 6, title: 'Effectively Managing Boundaries in Relationships', focus: 'Setting and maintaining boundaries without guilt' },
  { week: 7, title: 'Sustainable Performance in the Long Run', focus: 'Building lasting energy and performance after depletion' },
  { week: 8, title: 'Your Personalised Relapse Prevention Plan', focus: 'Your evidence-based long-term protection plan' },
];

const COHORT_DATE = new Date('2026-06-15T09:30:00Z'); // 19:30 AEST

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(target.getTime() - Date.now());
  useEffect(() => {
    const t = setInterval(() => setDiff(target.getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const days = Math.max(0, Math.floor(diff / 86400000));
  const hrs  = Math.max(0, Math.floor((diff % 86400000) / 3600000));
  const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));
  return { days, hrs, mins };
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

interface Profile {
  full_name: string | null;
  current_week: number;
  tier: string;
  access_expires_at: string | null;
}

export default function Dashboard() {
  const [profile, setProfile]           = useState<Profile | null>(null);
  const [completedWeeks, setCompleted]  = useState<number[]>([]);
  const [practices, setPractices]       = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const { days, hrs, mins }             = useCountdown(COHORT_DATE);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: p }, { data: completions }, { data: practiceData }] = await Promise.all([
        supabase.from('user_profiles')
          .select('full_name, current_week, tier, access_expires_at')
          .eq('id', user.id).single(),
        supabase.from('module_completions')
          .select('module_id, modules(week)').eq('user_id', user.id),
        supabase.from('micro_practices')
          .select('id, name, duration_minutes, category')
          .in('trigger_category', ['morning', 'high_stress', 'pre_sleep'])
          .limit(3),
      ]);

      setProfile(p);
      setCompleted((completions || []).map((c: any) => c.modules?.week).filter(Boolean));
      setPractices(practiceData || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const isIntensive = profile?.tier === 'intensive';
  const currentWeek = profile?.current_week || 1;
  const progressPct = Math.round((completedWeeks.length / 8) * 100);
  const firstName   = profile?.full_name?.split(' ')[0] || '';
  const currentMod  = WEEKS.find(w => w.week === currentWeek);

  const PHASE_LABELS: Record<number, string> = {
    1: 'Understanding & Untangling', 2: 'Understanding & Untangling',
    3: 'Sleep & Nervous System',     4: 'Sleep & Nervous System',
    5: 'Values & Boundaries',        6: 'Values & Boundaries',
    7: 'Sustain & Protect',          8: 'Sustain & Protect',
  };

  return (
    <div className="app-layout">
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">BurnoutOS</div>
        <nav className="sidebar-nav">
          <a href="/dashboard" className="sidebar-link active">⬡ Dashboard</a>
          <a href={`/programme/week/${currentWeek}`} className="sidebar-link">◎ Programme</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-user">{profile?.full_name || 'Your account'}</div>
          <a href="/account" className="sidebar-link" style={{ fontSize: 13, opacity: 0.6 }}>Your account</a>
          <button className="signout-btn" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main className="main-content" style={{ maxWidth: 900 }}>

        {/* Greeting */}
        <div className="page-header" style={{ marginBottom: 28 }}>
          <div className="page-title">
            {getGreeting()}{firstName ? `, ${firstName}` : ''}.
          </div>
          <div className="page-sub">Week {currentWeek} of 8 · {currentMod?.title}</div>
        </div>

        {/* ── Cohort countdown (Intensive only) ──────────────────────── */}
        {isIntensive && days >= 0 && (
          <div className="card" style={{
            marginBottom: 24, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 20, flexWrap: 'wrap',
            borderColor: 'rgba(232,75,42,0.25)', background: 'rgba(232,75,42,0.05)',
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ember)', marginBottom: 4 }}>
                Next live session
              </div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700 }}>
                Cohort 1 · Week 1 — The Neuroscience of Burnout
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                Monday 15 June 2026 · 7:30pm AEST · Zoom
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {(['Days', 'Hrs', 'Min'] as const).map((label, idx) => {
                const val = [days, hrs, mins][idx];
                return (
                <div key={label} style={{
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '8px 14px', textAlign: 'center', minWidth: 52,
                }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 800, color: 'var(--ember)', lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>{label}</div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Current week hero ──────────────────────────────────────── */}
        <a
          href={`/programme/week/${currentWeek}`}
          style={{ textDecoration: 'none', display: 'block', marginBottom: 24 }}
        >
          <div className="card" style={{
            borderColor: 'rgba(232,75,42,0.3)',
            background: 'linear-gradient(135deg, rgba(232,75,42,0.08) 0%, rgba(232,75,42,0.03) 100%)',
            display: 'flex', alignItems: 'center', gap: 20, cursor: 'pointer',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12, flexShrink: 0,
              background: 'var(--ember)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontFamily: 'var(--font-head)',
              fontSize: 20, fontWeight: 800, color: '#fff',
            }}>
              {currentWeek}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ember)', marginBottom: 4 }}>
                {PHASE_LABELS[currentWeek]} · Week {currentWeek} of 8
              </div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>
                {currentMod?.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                {currentMod?.focus}
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ember)', fontWeight: 600, flexShrink: 0 }}>
              Start reading →
            </div>
          </div>
        </a>

        {/* ── Stats row ──────────────────────────────────────────────── */}
        <div className="card-grid card-grid-3" style={{ marginBottom: 32 }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="card-label">Programme</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span className="card-value">{completedWeeks.length}</span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>/8 weeks done</span>
            </div>
            <div style={{ height: 3, background: 'var(--surface-2)', borderRadius: 2, marginTop: 4 }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: 'var(--ember)', borderRadius: 2, transition: 'width 0.5s ease' }} />
            </div>
          </div>
          <div className="card">
            <div className="card-label">Reading content</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span className="card-value" style={{ color: 'var(--success)' }}>8</span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>/8 weeks unlocked</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Available now</div>
          </div>
          <div className="card">
            <div className="card-label">Video sessions</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span className="card-value" style={{ color: '#d4a847' }}>0</span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>/8 uploaded</span>
            </div>
            <div style={{ fontSize: 11, color: '#d4a847', marginTop: 6 }}>From 15 June 2026</div>
          </div>
        </div>

        {/* ── Two column: weeks + practices ──────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

          {/* Week list */}
          <div>
            <div className="card-title" style={{ marginBottom: 14 }}>All 8 weeks</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {WEEKS.map(w => {
                const done    = completedWeeks.includes(w.week);
                const current = w.week === currentWeek;
                return (
                  <a
                    key={w.week}
                    href={`/programme/week/${w.week}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '13px 16px', borderRadius: 10,
                      border: current
                        ? '1px solid rgba(232,75,42,0.4)'
                        : done
                          ? '1px solid rgba(42,157,92,0.3)'
                          : '1px solid var(--border)',
                      background: current
                        ? 'rgba(232,75,42,0.06)'
                        : done
                          ? 'rgba(42,157,92,0.05)'
                          : 'var(--surface)',
                      transition: 'all 0.15s', cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      if (!current) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
                    }}
                    onMouseLeave={e => {
                      if (!current && !done) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                      else if (done) (e.currentTarget as HTMLElement).style.borderColor = 'rgba(42,157,92,0.3)';
                    }}
                    >
                      {/* Week number badge */}
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 800,
                        background: current ? 'var(--ember)' : done ? 'rgba(42,157,92,0.2)' : 'var(--surface-2)',
                        color: current ? '#fff' : done ? '#2a9d5c' : 'var(--text-muted)',
                      }}>
                        {done ? '✓' : w.week}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: current ? 600 : 500, color: current ? 'var(--text)' : done ? 'rgba(240,237,232,0.7)' : 'var(--text-muted)', marginBottom: 2 }}>
                          {w.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {w.focus}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: current ? 'var(--ember)' : 'var(--text-muted)', flexShrink: 0, fontWeight: current ? 600 : 400 }}>
                        {current ? 'Current →' : done ? 'Done' : 'Read →'}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Right: practices + AI coach */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Today's practices */}
            {practices.length > 0 && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: 14 }}>Today's practices</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {practices.map((p: any) => (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 0', borderBottom: '1px solid var(--border)',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.category}</div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>{p.duration_minutes} min</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Coach */}
            <div className="card" style={{ borderColor: 'rgba(26,107,114,0.3)', background: 'rgba(26,107,114,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                  background: 'rgba(26,107,114,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="5.5" stroke="#1a6b72" strokeWidth="1.3"/>
                    <path d="M7 4.5v2.5l1.5 1.5" stroke="#1a6b72" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                </div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 13, fontWeight: 700 }}>AI Recovery Coach</div>
                <span style={{ fontSize: 10, background: 'rgba(26,107,114,0.2)', color: '#1a6b72', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>Live</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
                Available 24/7 between sessions. Ask anything about burnout, recovery, or this week's content.
              </div>
              <a href="/ai-coach" style={{
                display: 'block', textAlign: 'center', background: 'rgba(26,107,114,0.15)',
                border: '1px solid rgba(26,107,114,0.3)', borderRadius: 8,
                padding: '9px', fontSize: 13, fontWeight: 600, color: '#1a8a78',
                textDecoration: 'none',
              }}>
                Open AI Coach →
              </a>
            </div>

            {/* Video notice */}
            <div style={{
              background: 'rgba(212,168,71,0.07)', border: '1px solid rgba(212,168,71,0.25)',
              borderRadius: 10, padding: '14px 16px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#d4a847', marginBottom: 4 }}>
                Video sessions
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Live session recordings upload within 24 hours of each Monday session, starting 15 June 2026.
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
