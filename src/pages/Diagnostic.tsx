export default function Diagnostic() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', fontFamily: 'var(--font-body)', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Nav */}
      <div style={{ width: '100%', maxWidth: '720px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '64px' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="13" fill="rgba(232,75,42,0.15)" />
            <circle cx="13" cy="13" r="6" fill="var(--ember)" opacity="0.9" />
            <circle cx="13" cy="13" r="3" fill="var(--ember)" />
          </svg>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>BurnoutOS</span>
        </a>
        <a href="/burnout-quiz" style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>Take the free quiz →</a>
      </div>

      <div style={{ width: '100%', maxWidth: '720px' }}>

        {/* Hero */}
        <div style={{ marginBottom: '56px' }}>
          <span style={{ display: 'inline-block', padding: '4px 14px', background: 'rgba(232,75,42,0.1)', border: '1px solid rgba(232,75,42,0.2)', borderRadius: '20px', fontSize: '11px', fontWeight: 700, color: 'var(--ember)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '24px' }}>
            Free · 20 minutes · No obligation
          </span>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.5px' }}>
            Free Burnout<br />Diagnostic Call
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.75, maxWidth: '560px' }}>
            A 20-minute conversation with Werner — a registered Clinical Psychologist with a decade of experience in burnout recovery — to understand where you are and what recovery actually looks like for you.
          </p>
        </div>

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '48px' }}>

          {/* What happens */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>What happens on the call</p>
            {[
              ['Understand your burnout profile', 'We map where you sit across exhaustion, cynicism, and efficacy — the three clinical dimensions.'],
              ['Identify your key drivers', 'Not all burnout has the same cause. We identify what is sustaining yours specifically.'],
              ['Get a clear first step', 'You leave with one concrete, evidence-based action — regardless of whether you proceed with the programme.'],
            ].map(([title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <circle cx="10" cy="10" r="10" fill="rgba(232,75,42,0.12)" />
                  <path d="M6 10l2.5 2.5L14 7" stroke="var(--ember)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Who this is for */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>This call is right for you if</p>
            {[
              'You are experiencing persistent exhaustion that rest does not fix',
              'You have lost motivation or meaning in work that once mattered',
              'You are functioning but feel like you are running on empty',
              'You want a professional perspective before committing to a programme',
              'You are wondering whether what you are experiencing is burnout or something else',
            ].map(item => (
              <div key={item} style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'flex-start' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '3px' }}>
                  <circle cx="8" cy="8" r="8" fill="rgba(26,107,114,0.15)" />
                  <path d="M4.5 8l2 2 4-4" stroke="#1a6b72" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* About Werner */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px', marginBottom: '32px', display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(232,75,42,0.12)', border: '1px solid rgba(232,75,42,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="11" r="5" fill="var(--ember)" opacity="0.7" />
              <path d="M4 26c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="var(--ember)" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.7" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Werner Teichert</div>
            <div style={{ fontSize: '12px', color: 'var(--ember)', marginBottom: '10px', fontWeight: 500 }}>Clinical Psychologist · AHPRA · HPCSA</div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65 }}>
              Clinical Psychologist and founder of Katalis. Specialises in evidence-based burnout recovery using ACT, CBT-I, and occupational health frameworks. Built BurnoutOS because the programmes he wanted to refer clients to did not exist.
            </p>
          </div>
        </div>

        {/* Booking CTA */}
        <div style={{ background: 'rgba(232,75,42,0.06)', border: '1px solid rgba(232,75,42,0.2)', borderRadius: '16px', padding: '36px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px' }}>
            Book your free call
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.65 }}>
            20 minutes. No sales pitch. If BurnoutOS is right for you, Werner will tell you. If it is not, he will tell you that too.
          </p>

          <a
            href="mailto:hello@burnout-os.app?subject=Burnout%20Diagnostic%20Call%20Request&body=Hi%20Werner%2C%0A%0AI%27d%20like%20to%20book%20a%20free%2020-minute%20Burnout%20Diagnostic%20Call.%0A%0AA%20bit%20about%20me%3A%0A-%20Name%3A%20%0A-%20Role%20%2F%20context%3A%20%0A-%20What%27s%20prompting%20the%20call%3A%20%0A%0APreferred%20times%20(AEST)%3A%0A-%20%0A-%20%0A-%20%0A%0AThanks%2C%0A"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'var(--ember)', color: '#fff', textDecoration: 'none', borderRadius: '10px', padding: '16px 36px', fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: '16px' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" stroke="#fff" strokeWidth="1.5" fill="none" />
              <path d="M1 5l8 5 8-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            Email to book your call
          </a>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', opacity: 0.6 }}>
            Werner replies within 1 business day · Zoom · AEST timezone</p>
        </div>

        {/* AHPRA disclaimer */}
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.4, textAlign: 'center', marginTop: '32px', lineHeight: 1.6, maxWidth: '520px', margin: '32px auto 0' }}>
          BurnoutOS is an evidence-informed psychoeducational programme. This call is an initial consultation, not ongoing psychological treatment. Werner Teichert is registered with AHPRA (Psychology Board of Australia) and HPCSA as a Clinical Psychologist.
        </p>

      </div>
    </div>
  );
}
