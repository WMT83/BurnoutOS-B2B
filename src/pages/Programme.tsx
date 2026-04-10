import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ModuleData {
  id: string;
  week: number;
  title: string;
  focus_area: string;
  reading_content: string;
}

interface Practice {
  id: string;
  name: string;
  duration_minutes: number;
  category: string;
}

export default function Programme() {
  const { weekNum } = useParams<{ weekNum: string }>();
  const week = parseInt(weekNum || '1', 10);

  const [mod, setMod] = useState<ModuleData | null>(null);
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [marking, setMarking] = useState(false);

  // Fetch module + practices + completion status
  useEffect(() => {
    setLoading(true);
    setMod(null);
    setPractices([]);
    setCompleted(false);

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();

      // Fetch module from Supabase
      const { data: modData } = await supabase
        .from('modules')
        .select('id, week, title, focus_area, reading_content')
        .eq('week', week)
        .single();

      if (modData) {
        setMod(modData as ModuleData);

        // Check completion
        if (user) {
          const { data: comp } = await supabase
            .from('module_completions')
            .select('id')
            .eq('user_id', user.id)
            .eq('module_id', modData.id)
            .single();
          if (comp) setCompleted(true);
        }
      }

      // Fetch practices for this week (map week to trigger categories)
      const WEEK_TRIGGERS: Record<number, string[]> = {
        1: ['morning', 'grounding'],
        2: ['high_stress', 'acute_stress'],
        3: ['rumination', 'pre_sleep'],
        4: ['pre_sleep', 'evening'],
        5: ['morning', 'afternoon'],
        6: ['pre_meeting', 'transition'],
        7: ['evening', 'pre_sleep'],
        8: ['morning', 'afternoon'],
      };
      const triggers = WEEK_TRIGGERS[week] || ['morning'];
      const { data: practiceData } = await supabase
        .from('micro_practices')
        .select('id, name, duration_minutes, category')
        .in('trigger_category', triggers)
        .limit(3);

      if (practiceData) setPractices(practiceData as Practice[]);
      setLoading(false);
    }

    load();
  }, [week]);

  async function markComplete() {
    setMarking(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !mod) { setMarking(false); return; }
    await supabase.from('module_completions').upsert({ user_id: user.id, module_id: mod.id });
    if (week < 8) {
      await supabase.from('user_profiles').update({ current_week: week + 1 }).eq('id', user.id);
    }
    setCompleted(true);
    setMarking(false);
  }

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!mod) return (
    <div className="loading-screen">
      <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Week {week} content not found.</div>
    </div>
  );

  // Parse reading_content — strip markdown headings for the intro section
  const contentLines = mod.reading_content || '';
  const paragraphs = contentLines
    .split('\n\n')
    .filter(p => p.trim() && !p.trim().startsWith('#'))
    .map(p => p.replace(/^#+\s+/, '').trim());

  // First 2 paragraphs = intro, rest = reflection
  const introParagraphs = paragraphs.slice(0, 2);
  const reflectionParagraphs = paragraphs.slice(2, 5);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">BurnoutOS</div>
        <nav className="sidebar-nav">
          <a href="/dashboard" className="sidebar-link">⬡ Dashboard</a>
          <a href={`/programme/week/${week}`} className="sidebar-link active">◎ Programme</a>
        </nav>
        <div className="sidebar-bottom">
          <button className="signout-btn" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </aside>

      <main className="main-content">
        <a href="/dashboard" className="programme-back">← Back to dashboard</a>
        <div className="programme-week-label">Week {week} of 8</div>
        <div className="programme-title">{mod.title}</div>
        <div className="programme-focus">{mod.focus_area}</div>

        <div className="content-section">
          <h3>This week</h3>
          <div className="content-block">
            {introParagraphs.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>

        {practices.length > 0 && (
          <div className="content-section">
            <h3>Daily practices</h3>
            <div className="practice-list">
              {practices.map((p) => (
                <div key={p.id} className="practice-item">
                  <span className="practice-name">{p.name}</span>
                  <span className="practice-duration">{p.duration_minutes} min</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {reflectionParagraphs.length > 0 && (
          <div className="content-section">
            <h3>Reflection</h3>
            <div className="content-block">
              {reflectionParagraphs.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        )}

        {/* Video placeholder */}
        <div className="content-section">
          <h3>Live session</h3>
          <div style={{
            background: 'rgba(212,168,71,0.08)', border: '1px solid rgba(212,168,71,0.25)',
            borderRadius: 10, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 14
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="4" width="18" height="12" rx="2.5" stroke="#d4a847" strokeWidth="1.5" fill="none"/>
              <path d="M8 8l4 2-4 2V8z" fill="#d4a847"/>
            </svg>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>
                Session recording
              </div>
              <div style={{ fontSize: 12, color: '#d4a847' }}>
                Uploads within 24 hours of the live Monday session from 15 June 2026
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
          {week > 1 && (
            <a href={`/programme/week/${week - 1}`} style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none' }}>
              ← Week {week - 1}
            </a>
          )}
          {week < 8 && (
            <a href={`/programme/week/${week + 1}`} style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none' }}>
              Week {week + 1} →
            </a>
          )}
        </div>

        {/* Complete / completed */}
        {!completed ? (
          <button className="complete-btn" onClick={markComplete} disabled={marking} style={{ marginTop: 20 }}>
            {marking ? 'Saving…' : 'Mark week complete →'}
          </button>
        ) : (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'rgba(42,157,92,0.12)', border: '1px solid rgba(42,157,92,0.3)',
            borderRadius: 10, padding: '14px 24px', marginTop: 20
          }}>
            <span style={{ color: '#2a9d5c', fontWeight: 600 }}>✓ Week {week} complete</span>
            {week < 8 && (
              <a href={`/programme/week/${week + 1}`} style={{ color: 'var(--ember)', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                Start week {week + 1} →
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
