import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, Users, TrendingUp, DollarSign, Plus, ChevronRight, RefreshCw } from 'lucide-react';

type Org = {
  id: string; name: string; industry: string | null; employee_count: number | null;
  primary_contact_name: string | null; primary_contact_email: string | null; source: string | null;
  created_at: string;
};
type Assessment = {
  id: string; organisation_id: string; status: string; engagement_fee: number;
  survey_token: string; total_score: number | null; risk_level: string | null;
  burnout_cost_aud: number | null; created_at: string;
  organisations: { name: string } | null;
};
type Metrics = {
  total_organisations: number; total_diagnostics: number; converted_diagnostics: number;
  diagnostic_conversion_pct: number; total_mrr: number; total_arr: number;
  total_employees_on_platform: number; total_diagnostic_revenue: number;
};

const SURVEY_BASE = import.meta.env.VITE_SURVEY_BASE_URL || window.location.origin;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--teal-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color="var(--teal)" />
      </div>
      <div>
        <p style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)', lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{sub}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`badge badge-${status}`}>{status.replace(/_/g, ' ')}</span>;
}

export default function Admin() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [tab, setTab] = useState<'assessments' | 'orgs'>('assessments');
  const [showNewOrg, setShowNewOrg] = useState(false);
  const [showNewAssessment, setShowNewAssessment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState('');

  // New org form
  const [orgForm, setOrgForm] = useState({ name: '', industry: '', employee_count: '', primary_contact_name: '', primary_contact_email: '', primary_contact_role: '', source: 'diagnostic' });
  // New assessment form
  const [assessmentOrgId, setAssessmentOrgId] = useState('');

  const [scoringId, setScoringId] = useState('');

  async function scoreAssessment(assessment: Assessment) {
    setScoringId(assessment.id);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/aggregate-assessment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ assessment_id: assessment.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scoring failed');
      load();
    } catch (err: any) {
      alert(`Scoring error: ${err.message}`);
    } finally {
      setScoringId('');
    }
  }

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: m }, { data: a }, { data: o }] = await Promise.all([
      supabase.from('business_metrics').select('*').single(),
      supabase.from('diagnostic_assessments').select('*, organisations(name)').order('created_at', { ascending: false }).limit(50),
      supabase.from('organisations').select('*').order('created_at', { ascending: false }),
    ]);
    setMetrics(m as Metrics);
    setAssessments((a as Assessment[]) || []);
    setOrgs((o as Org[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createOrg() {
    if (!orgForm.name.trim()) return;
    await supabase.from('organisations').insert({
      name: orgForm.name.trim(),
      industry: orgForm.industry || null,
      employee_count: orgForm.employee_count ? parseInt(orgForm.employee_count) : null,
      primary_contact_name: orgForm.primary_contact_name || null,
      primary_contact_email: orgForm.primary_contact_email || null,
      primary_contact_role: orgForm.primary_contact_role || null,
      source: orgForm.source,
    });
    setOrgForm({ name: '', industry: '', employee_count: '', primary_contact_name: '', primary_contact_email: '', primary_contact_role: '', source: 'diagnostic' });
    setShowNewOrg(false);
    load();
  }

  async function createAssessment() {
    if (!assessmentOrgId) return;
    await supabase.from('diagnostic_assessments').insert({ organisation_id: assessmentOrgId });
    setAssessmentOrgId('');
    setShowNewAssessment(false);
    setTab('assessments');
    load();
  }

  async function sendSurvey(assessment: Assessment) {
    const url = `${SURVEY_BASE}/diagnostic/survey/${assessment.survey_token}`;
    await navigator.clipboard.writeText(url);
    setCopiedToken(assessment.id);
    await supabase.from('diagnostic_assessments').update({ status: 'survey_sent', survey_sent_at: new Date().toISOString() }).eq('id', assessment.id);
    setTimeout(() => setCopiedToken(''), 2000);
    load();
  }

  const fmt = (n: number | null, prefix = '') => n == null ? '—' : `${prefix}${n.toLocaleString()}`;
  const fmtCurrency = (n: number | null) => n == null ? '—' : `AUD ${n.toLocaleString('en-AU', { minimumFractionDigits: 0 })}`;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)',
    fontSize: 14, background: 'var(--white)', color: 'var(--navy)',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off)' }}>
      {/* Top nav */}
      <nav style={{ background: 'var(--navy)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--teal-20)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--teal)', fontWeight: 800, fontSize: 13 }}>B</span>
          </div>
          <span style={{ color: 'var(--white)', fontWeight: 700, fontSize: 15 }}>Burnout OS</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginLeft: 4 }}>Admin</span>
        </div>
        <button onClick={load} style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard icon={Building2} label="Organisations" value={fmt(metrics?.total_organisations ?? null)} />
          <StatCard icon={TrendingUp} label="Diagnostics" value={fmt(metrics?.total_diagnostics ?? null)} sub={`${metrics?.diagnostic_conversion_pct ?? 0}% converted`} />
          <StatCard icon={DollarSign} label="Diagnostic Revenue" value={fmtCurrency(metrics?.total_diagnostic_revenue ?? null)} />
          <StatCard icon={DollarSign} label="Platform ARR" value={fmtCurrency(metrics?.total_arr ?? null)} sub={`MRR: ${fmtCurrency(metrics?.total_mrr ?? null)}`} />
          <StatCard icon={Users} label="Employees on Platform" value={fmt(metrics?.total_employees_on_platform ?? null)} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => setShowNewOrg(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> New Organisation
          </button>
          <button className="btn-outline" onClick={() => setShowNewAssessment(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> New Assessment
          </button>
        </div>

        {/* New Org Modal */}
        {showNewOrg && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) setShowNewOrg(false); }}>
            <div className="card" style={{ width: '100%', maxWidth: 500 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 20 }}>New Organisation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Organisation name *', key: 'name', placeholder: 'Acme Corp' },
                  { label: 'Industry', key: 'industry', placeholder: 'Financial Services' },
                  { label: 'Employee count', key: 'employee_count', placeholder: '250' },
                  { label: 'Primary contact name', key: 'primary_contact_name', placeholder: 'Jane Smith' },
                  { label: 'Primary contact email', key: 'primary_contact_email', placeholder: 'jane@acmecorp.com' },
                  { label: 'Contact role', key: 'primary_contact_role', placeholder: 'Head of People & Culture' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{f.label}</label>
                    <input style={inputStyle} placeholder={f.placeholder} value={(orgForm as any)[f.key]}
                      onChange={e => setOrgForm(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>Source</label>
                  <select style={inputStyle} value={orgForm.source} onChange={e => setOrgForm(p => ({ ...p, source: e.target.value }))}>
                    {['diagnostic', 'inbound', 'referral', 'event'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button className="btn-outline" onClick={() => setShowNewOrg(false)}>Cancel</button>
                <button className="btn-primary" onClick={createOrg} disabled={!orgForm.name.trim()}>Create Organisation</button>
              </div>
            </div>
          </div>
        )}

        {/* New Assessment Modal */}
        {showNewAssessment && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) setShowNewAssessment(false); }}>
            <div className="card" style={{ width: '100%', maxWidth: 400 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>New Diagnostic Assessment</h3>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>Select Organisation</label>
              <select style={{ ...inputStyle, marginBottom: 20 }} value={assessmentOrgId} onChange={e => setAssessmentOrgId(e.target.value)}>
                <option value="">— Choose organisation —</option>
                {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-outline" onClick={() => setShowNewAssessment(false)}>Cancel</button>
                <button className="btn-primary" onClick={createAssessment} disabled={!assessmentOrgId}>Create Assessment</button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 20 }}>
          {(['assessments', 'orgs'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, background: 'transparent',
                color: tab === t ? 'var(--navy)' : 'var(--muted)',
                borderBottom: tab === t ? '2px solid var(--teal)' : '2px solid transparent',
                marginBottom: -2, transition: 'color 0.15s' }}>
              {t === 'assessments' ? 'Diagnostics' : 'Organisations'}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)', padding: '32px 0', textAlign: 'center' }}>Loading…</p>
        ) : tab === 'assessments' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {assessments.length === 0 && <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 32 }}>No assessments yet. Create one above.</p>}
            {assessments.map(a => (
              <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{a.organisations?.name ?? '—'}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(a.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <StatusBadge status={a.status} />
                {a.risk_level && <span className={`badge badge-${a.risk_level}`}>{a.risk_level} risk</span>}
                {a.total_score != null && <span style={{ fontSize: 13, color: 'var(--muted)' }}>Score: <strong>{a.total_score}</strong></span>}
                {a.burnout_cost_aud != null && <span style={{ fontSize: 13, color: 'var(--muted)' }}>Est. cost: <strong>{fmtCurrency(a.burnout_cost_aud)}</strong></span>}
                <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                  {(a.status === 'responses_received' || a.status === 'survey_sent') && (
                    <button
                      className="btn-primary"
                      onClick={() => scoreAssessment(a)}
                      disabled={scoringId === a.id}
                      style={{ fontSize: 12, padding: '6px 14px' }}>
                      {scoringId === a.id ? 'Scoring…' : '⚡ Run Scoring'}
                    </button>
                  )}
                  <button
                    className="btn-outline"
                    onClick={() => sendSurvey(a)}
                    style={{ fontSize: 12, padding: '6px 14px' }}>
                    {copiedToken === a.id ? '✓ Copied!' : 'Copy Survey Link'}
                  </button>
                  <ChevronRight size={18} color="var(--muted)" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orgs.length === 0 && <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 32 }}>No organisations yet.</p>}
            {orgs.map(o => (
              <div key={o.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>{o.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>{o.industry ?? '—'} · {o.employee_count ? `${o.employee_count} employees` : 'headcount unknown'}</p>
                </div>
                {o.primary_contact_name && (
                  <div style={{ fontSize: 13 }}>
                    <p style={{ fontWeight: 600 }}>{o.primary_contact_name}</p>
                    <p style={{ color: 'var(--muted)' }}>{o.primary_contact_email ?? ''}</p>
                  </div>
                )}
                {o.source && <span className="badge" style={{ background: 'var(--teal-10)', color: 'var(--navy)' }}>{o.source}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
