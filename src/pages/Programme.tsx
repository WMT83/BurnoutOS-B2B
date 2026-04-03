import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const WEEK_CONTENT: Record<number, {
  title: string; focus: string; intro: string;
  practices: Array<{ name: string; duration: string }>;
  reading: string;
}> = {
  1: {
    title: 'Understanding Burnout',
    focus: 'ACT Foundations & Awareness',
    intro: 'Burnout is not a character flaw or a sign of weakness — it is a predictable response to chronic workplace stress without adequate recovery. This week we build the foundation: understanding what burnout actually is, how it develops, and why the standard advice ("take a break, exercise more") fails to address its roots.\n\nWe begin with Acceptance and Commitment Therapy (ACT), an evidence-based approach that has shown strong results for burnout recovery. Unlike approaches that focus on eliminating difficult thoughts and feelings, ACT teaches us to change our relationship with them — creating the psychological flexibility to move toward what matters even when exhaustion is present.',
    practices: [
      { name: 'Morning grounding — 5 senses check-in', duration: '3 min' },
      { name: 'Burnout body scan — notice without judgment', duration: '8 min' },
      { name: 'Values compass — what matters most right now?', duration: '5 min' },
    ],
    reading: 'This week, notice moments when you are running on autopilot — doing tasks without presence, moving through the day without awareness. These are not character flaws. They are signs that your nervous system has learned to conserve resources. Awareness is the first step toward change.\n\nJot down: what does burnout feel like in your body? Where do you notice it? What thoughts accompany it? You do not need to fix anything this week — only observe.'
  },
  2: {
    title: 'Defusion & Distance',
    focus: 'Cognitive Defusion Techniques',
    intro: 'Our minds generate a constant stream of thoughts — many of them harsh, repetitive, and exhausting. "I should be doing more." "I can not keep up." "Something is wrong with me." In burnout, these thoughts become like a soundtrack we cannot switch off.\n\nCognitive defusion is an ACT technique that helps us create distance from our thoughts — seeing them as mental events rather than facts. This week we practise stepping back from the thought-stream rather than being swept along by it.',
    practices: [
      { name: 'Leaves on a stream — thought defusion meditation', duration: '10 min' },
      { name: 'Name it to tame it — labelling difficult thoughts', duration: '5 min' },
      { name: 'Workload audit — one thing to set down today', duration: '10 min' },
    ],
    reading: 'When a harsh thought arrives this week, try adding "I notice I am having the thought that..." before it. "I am a failure" becomes "I notice I am having the thought that I am a failure." This small linguistic shift creates space between you and the thought — enough space to choose your response rather than react automatically.\n\nNotice: how much of your mental energy this week is spent arguing with, suppressing, or trying to solve your thoughts rather than doing the things that matter?'
  },
  3: {
    title: 'Present Moment',
    focus: 'Mindfulness & Grounding',
    intro: 'Burnout pulls us out of the present — into rumination about the past ("I should have done more") or anxiety about the future ("how will I cope with next week?"). The present moment is the only place where recovery actually happens.\n\nThis week we build present-moment awareness as a practical skill — not a spiritual exercise. Moments of presence are moments of recovery. They interrupt the stress cycle and allow the nervous system to regulate.',
    practices: [
      { name: 'Mindful coffee/tea — full attention for one drink', duration: '5 min' },
      { name: '4-7-8 breathing — nervous system reset', duration: '4 min' },
      { name: 'Single-tasking experiment — one task, full attention', duration: '25 min' },
    ],
    reading: 'The research on multitasking is clear: it does not exist. What we call multitasking is rapid attention-switching, and it is cognitively expensive. In burnout, single-tasking feels impossible — but it is actually the skill that builds recovery capacity.\n\nThis week: choose one task each day to do with full attention. No phone, no tabs, no mental rehearsal of the next task. Notice what happens to your energy when you are fully present to one thing.'
  },
  4: {
    title: 'The Observing Self',
    focus: 'Self-as-Context',
    intro: 'There is a part of you that watches your thoughts, feelings, and experiences — the observing self. It is the awareness behind the content of your mind. It has been present throughout every experience you have ever had, and it cannot be burned out.\n\nThis week we explore self-as-context — one of the most powerful and underutilised concepts in ACT. When we are fused with our thoughts and feelings ("I am burned out"), we have lost sight of the observer. This week we find our way back.',
    practices: [
      { name: 'Observer meditation — noticing the noticer', duration: '12 min' },
      { name: 'Perspective shift — the ten-year view', duration: '8 min' },
      { name: 'Evening reflection — three things that went well', duration: '5 min' },
    ],
    reading: 'Burnout often involves a collapsed sense of self — we become identical with our exhaustion, our overwhelm, our performance. "I am burned out" rather than "I am experiencing burnout."\n\nThe observing self practice creates the ground from which recovery is possible. You are not your burnout. You are the awareness that is noticing the burnout. This is not semantics — it is a fundamental shift in relationship to experience that changes what becomes possible.'
  },
  5: {
    title: 'Values Clarity',
    focus: 'Identifying What Matters',
    intro: 'Burnout often involves a disconnection from what matters most. We become so focused on surviving the workload that we lose sight of why we were doing the work in the first place. Values are not goals — they are directions of travel. They tell us what kind of person we want to be and what kind of life we want to live.\n\nThis week we reconnect with values as the compass for recovery. Not what we should value, or what others think we should value — what actually matters to us.',
    practices: [
      { name: 'Values card sort — rank what matters most', duration: '15 min' },
      { name: 'One values-aligned action today — however small', duration: '10 min' },
      { name: 'The rocking chair test — long-term perspective', duration: '10 min' },
    ],
    reading: 'A useful question: if your burnout were completely resolved tomorrow, what would you do differently? What would you move toward? What would you stop tolerating? The answers point toward your values.\n\nAnother: what aspects of your work — even in the exhaustion — still feel meaningful? Even a thread of meaning is worth following. Recovery is not just the absence of burnout — it is the presence of a life that feels worth living.'
  },
  6: {
    title: 'Committed Action',
    focus: 'Behavioural Activation',
    intro: 'Insight without action is incomplete. This week we move from understanding to doing — taking small, consistent, values-aligned actions even when motivation is low. This is behavioural activation: one of the most evidence-based interventions for depression, exhaustion, and burnout.\n\nThe key insight: we do not wait to feel better before we act. We act — and the acting changes how we feel. This is the opposite of what burnout tells us ("wait until you have energy to do anything meaningful").',
    practices: [
      { name: 'Micro-commitment — one 10-minute values action today', duration: '10 min' },
      { name: 'Boundary experiment — one "no" or one limit this week', duration: '10 min' },
      { name: 'Energy audit — high/low energy tasks mapped', duration: '15 min' },
    ],
    reading: 'Burnout thrives in avoidance. The more we withdraw from meaningful activity (because we are exhausted), the more depleted we feel. Behavioural activation interrupts this cycle by starting small — not with motivation, but with action.\n\nThis week: choose one small thing that aligns with a value and do it regardless of how you feel. It does not need to be significant. It needs to be consistent. Consistency is how recovery is built.'
  },
  7: {
    title: 'Boundaries & Restoration',
    focus: 'Sleep & Recovery Protocols',
    intro: 'Recovery requires recovery time. This sounds obvious — but burnout systematically erodes the boundaries that protect restoration. We check email at 10pm. We skip lunch. We bring work into bed. We justify it all as "necessary."\n\nThis week is about the physiology of recovery: what the nervous system actually needs to repair, and how to protect the conditions that make repair possible. Sleep is the foundation — not a luxury, not a personality trait, but a biological requirement for cognitive and emotional function.',
    practices: [
      { name: 'Sleep hygiene protocol — wind-down routine design', duration: '20 min' },
      { name: 'Digital sunset — screens off 60 minutes before bed', duration: 'Daily' },
      { name: 'Restorative walk — no phone, no podcast', duration: '20 min' },
    ],
    reading: 'Matthew Walker\'s research on sleep is unambiguous: adults need 7-9 hours for full cognitive and emotional restoration. In burnout, we often operate on 5-6 hours and call it "fine" — but the accumulated sleep debt is a major driver of the emotional dysregulation, reduced resilience, and impaired decision-making that define the burnout experience.\n\nThis week: treat sleep as a non-negotiable boundary. Notice what thoughts arrive when you try to protect it. What does your mind say? That is where the work is.'
  },
  8: {
    title: 'Sustainable Recovery',
    focus: 'Integration & Long-term Plan',
    intro: 'You have completed eight weeks of deliberate recovery work. This final week is about integration — taking what has worked and building it into a sustainable system that continues beyond this programme.\n\nRecovery is not a destination — it is a practice. The skills you have built (defusion, present-moment awareness, values clarity, committed action, restorative boundaries) are not a checklist to complete. They are a way of relating to your work and your life that protects against future burnout.',
    practices: [
      { name: 'My recovery plan — written integration exercise', duration: '30 min' },
      { name: 'Monthly review design — one check-in per month', duration: '15 min' },
      { name: 'Letter to future self — six months from now', duration: '20 min' },
    ],
    reading: 'What would it mean to have graduated from burnout recovery — not to a life without difficulty, but to a life where you have the skills to meet difficulty without being consumed by it?\n\nThe research on ACT shows that psychological flexibility — the ability to be present, open to experience, and engaged in values-based action — is the strongest predictor of long-term wellbeing. You have been building this capacity for eight weeks. Do not stop here.\n\nYou have done hard and important work. The recovery is real. Protect it.'
  },
};

export default function Programme() {
  const { weekNum } = useParams<{ weekNum: string }>();
  const week = parseInt(weekNum || '1', 10);
  const content = WEEK_CONTENT[week];
  const [completed, setCompleted] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    async function checkCompletion() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: mod } = await supabase.from('modules').select('id').eq('week', week).single();
      if (!mod) return;
      const { data: comp } = await supabase.from('module_completions')
        .select('id').eq('user_id', user.id).eq('module_id', mod.id).single();
      if (comp) setCompleted(true);
    }
    checkCompletion();
  }, [week]);

  async function markComplete() {
    setMarking(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: mod } = await supabase.from('modules').select('id').eq('week', week).single();
    if (!mod) { setMarking(false); return; }
    await supabase.from('module_completions').upsert({ user_id: user.id, module_id: mod.id });
    if (week < 8) {
      await supabase.from('user_profiles').update({ current_week: week + 1 }).eq('id', user.id);
    }
    setCompleted(true);
    setMarking(false);
  }

  if (!content) return <div className="loading-screen"><div className="spinner" /></div>;

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
        <div className="programme-title">{content.title}</div>
        <div className="programme-focus">{content.focus}</div>

        <div className="content-section">
          <h3>This week</h3>
          <div className="content-block">
            {content.intro.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>

        <div className="content-section">
          <h3>Daily practices</h3>
          <div className="practice-list">
            {content.practices.map((p, i) => (
              <div key={i} className="practice-item">
                <span className="practice-name">{p.name}</span>
                <span className="practice-duration">{p.duration}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="content-section">
          <h3>Reflection</h3>
          <div className="content-block">
            {content.reading.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>

        {week < 8 && (
          <a href={`/programme/week/${week + 1}`} style={{ display: 'inline-block', marginRight: 16, color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none' }}>
            Week {week + 1} →
          </a>
        )}

        {!completed ? (
          <button className="complete-btn" onClick={markComplete} disabled={marking}>
            {marking ? 'Saving…' : 'Mark week complete →'}
          </button>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(42,157,92,0.12)', border: '1px solid rgba(42,157,92,0.3)', borderRadius: 10, padding: '14px 24px', marginTop: 32 }}>
            <span style={{ color: '#2a9d5c', fontWeight: 600 }}>✓ Week {week} complete</span>
            {week < 8 && <a href={`/programme/week/${week + 1}`} style={{ color: 'var(--ember)', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>Start week {week + 1} →</a>}
          </div>
        )}
      </main>
    </div>
  );
}
