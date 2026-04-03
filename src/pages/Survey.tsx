import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const SECTION_LABELS: Record<string, string> = {
  workload: 'Workload',
  autonomy: 'Autonomy & Control',
  recognition: 'Recognition & Reward',
  community: 'Community & Support',
  fairness: 'Fairness',
  values: 'Values & Purpose',
  burnout_indicators: 'Wellbeing Check',
};

const SECTION_ORDER = ['workload', 'autonomy', 'recognition', 'community', 'fairness', 'values', 'burnout_indicators'];

const SCALE_LABELS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];

type Question = { id: string; section: string; question_text: string; sort_order: number };
type Respondent = { id: string; assessment_id: string; completed: boolean };

export default function Survey() {
  const { token } = useParams<{ token: string }>();
  const [respondent, setRespondent] = useState<Respondent | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!token) return;
      const { data: resp } = await supabase
        .from('survey_respondents')
        .select('id, assessment_id, completed')
        .eq('token', token)
        .single();

      if (!resp) { setError('This survey link is invalid or has expired.'); setLoading(false); return; }
      if (resp.completed) { setSubmitted(true); setLoading(false); return; }
      setRespondent(resp);

      const { data: qs } = await supabase
        .from('survey_questions')
        .select('id, section, question_text, sort_order')
        .eq('active', true)
        .order('sort_order');
      setQuestions(qs || []);
      setLoading(false);
    }
    load();
  }, [token]);

  const sections = SECTION_ORDER.filter(s => questions.some(q => q.section === s));
  const currentSectionKey = sections[currentSection];
  const sectionQuestions = questions.filter(q => q.section === currentSectionKey);
  const sectionAnswered = sectionQuestions.every(q => answers[q.id] !== undefined);
  const progress = Math.round(((currentSection) / sections.length) * 100);

  async function handleSubmit() {
    if (!respondent) return;
    setSubmitting(true);

    const responses = Object.entries(answers).map(([question_id, val]) => ({
      respondent_id: respondent.id,
      assessment_id: respondent.assessment_id,
      question_id,
      response_value: String(val + 1),
      score: ((val / 4) * 10),
    }));

    await supabase.from('survey_responses').insert(responses);
    await supabase.from('survey_respondents').update({ completed: true, completed_at: new Date().toISOString() }).eq('id', respondent.id);
    setSubmitting(false);
    setSubmitted(true);
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--muted)' }}>Loading survey…</p>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="card" style={{ maxWidth: 480, textAlign: 'center' }}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>⚠️</p>
        <h2 style={{ marginBottom: 8 }}>Invalid Survey Link</h2>
        <p style={{ color: 'var(--muted)' }}>{error}</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="card" style={{ maxWidth: 480, textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--teal-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <span style={{ fontSize: 24 }}>✓</span>
        </div>
        <h2 style={{ marginBottom: 8, color: 'var(--navy)' }}>Thank you</h2>
        <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>
          Your responses have been recorded. They will be aggregated anonymously as part of your organisation's wellbeing diagnostic. Results will be shared with your leadership team.
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off)', padding: '24px 16px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--teal)', fontWeight: 800, fontSize: 14 }}>B</span>
            </div>
            <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 15 }}>Burnout OS</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>Organisational Wellbeing Survey</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>Your responses are anonymous and aggregated. This takes approximately 5 minutes.</p>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Section {currentSection + 1} of {sections.length}</span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{progress}% complete</span>
          </div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 99 }}>
            <div style={{ height: 6, background: 'var(--teal)', borderRadius: 99, width: `${progress}%`, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Section card */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{SECTION_LABELS[currentSectionKey]}</h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24 }}>Rate each statement from Never to Always.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {sectionQuestions.map((q, i) => (
              <div key={q.id}>
                <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 14, lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--muted)', fontSize: 13, marginRight: 6 }}>{i + 1}.</span>
                  {q.question_text}
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {SCALE_LABELS.map((label, idx) => {
                    const selected = answers[q.id] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.id]: idx }))}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                          border: `2px solid ${selected ? 'var(--teal)' : 'var(--border)'}`,
                          background: selected ? 'var(--teal-10)' : 'var(--white)',
                          color: selected ? 'var(--navy)' : 'var(--muted)',
                          transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ fontSize: 16, marginBottom: 2 }}>{idx + 1}</div>
                        <div style={{ fontSize: 10, lineHeight: 1.2 }}>{label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
          <button
            className="btn-outline"
            onClick={() => setCurrentSection(s => s - 1)}
            disabled={currentSection === 0}
            style={{ opacity: currentSection === 0 ? 0.35 : 1 }}
          >
            ← Back
          </button>

          {currentSection < sections.length - 1 ? (
            <button
              className="btn-primary"
              onClick={() => setCurrentSection(s => s + 1)}
              disabled={!sectionAnswered}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!sectionAnswered || submitting}
            >
              {submitting ? 'Submitting…' : 'Submit Survey ✓'}
            </button>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 24 }}>
          Powered by <strong>Burnout OS</strong> · by Katalis Health
        </p>
      </div>
    </div>
  );
}
