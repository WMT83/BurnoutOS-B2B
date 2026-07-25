// tour-modal.js — vanilla JS modal for SA Tour 2026 registration
// Drops into tour.html, tour-individual.html, tour-corporate.html via a single
// <script src="/tour-modal.js"></script> tag. Exposes window.openTourModal().
//
// No external dependencies. No build step. Modern vanilla JS only.

(function () {
  'use strict';

  // ─── Configuration ──────────────────────────────────────────
  const SUPABASE_URL = 'https://kvsirypfqtnymooxicti.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_Azjgh5OVpFG2Z2oyQqt0Ig_E0tVk2W8';
  const TOUR_SLUG = 'sa-2026';

  // Cohort UUIDs (fixed for SA Tour 2026)
  const COHORTS = {
    johannesburg: {
      id: 'b2b78683-06b0-463c-b63c-8419f9307f94',
      label: 'Johannesburg',
      dates: '10 to 12 October 2026',
      seatsTotal: 20,
    },
    capetown: {
      id: 'f1ff2f67-759b-4870-a438-d6326b7247f2',
      label: 'Cape Town',
      dates: '16 to 18 October 2026',
      seatsTotal: 20,
    },
  };

  // Pricing (display only — server is authoritative)
  const PRICES = {
    individual_early_bird: 8950,
    individual_standard: 10950,
    individual_instalment_early_bird: 1890,
    individual_instalment_standard: 1890,
    corporate_per_seat: 12950,
    corporate_tier_3_5_pct: 10,
    corporate_tier_6_plus_pct: 15,
  };

  const EARLY_BIRD_END = '2026-08-31';

  // ─── Utility functions ──────────────────────────────────────

  function isEarlyBird() {
    const today = new Date().toISOString().slice(0, 10);
    return today <= EARLY_BIRD_END;
  }

  function formatZar(amount) {
    return 'R' + Math.round(amount).toLocaleString('en-ZA');
  }

  function getUtmParams() {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    ['source', 'medium', 'campaign', 'content', 'term'].forEach(key => {
      const val = params.get(`utm_${key}`);
      if (val) utm[key] = val;
    });
    return Object.keys(utm).length ? utm : null;
  }

  function getReferrer() {
    return document.referrer || null;
  }

  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function computeCorporateDiscount(places) {
    if (places >= 6) return PRICES.corporate_tier_6_plus_pct;
    if (places >= 3) return PRICES.corporate_tier_3_5_pct;
    return 0;
  }

  function computeCorporateTotal(places) {
    const discount = computeCorporateDiscount(places);
    const subtotal = places * PRICES.corporate_per_seat;
    return Math.round(subtotal * (100 - discount) / 100);
  }

  // ─── Styles ─────────────────────────────────────────────────

  const STYLES = `
    .bos-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(8, 10, 16, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 9999;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 4vh 1rem;
      overflow-y: auto;
      animation: bos-fade-in 0.2s ease-out;
    }
    @keyframes bos-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes bos-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .bos-modal-panel {
      position: relative;
      background: linear-gradient(180deg, #161b26 0%, #0c1018 100%);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      max-width: 560px;
      width: 100%;
      color: #f0ede8;
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      animation: bos-slide-up 0.3s ease-out;
      overflow: hidden;
    }
    .bos-modal-panel.is-corporate {
      border-color: rgba(139, 127, 209, 0.25);
    }
    .bos-modal-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: rgba(240, 237, 232, 0.7);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      z-index: 2;
    }
    .bos-modal-close:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }
    .bos-modal-header {
      padding: 2rem 2rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .bos-modal-eyebrow {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #e84b2a;
      margin-bottom: 0.5rem;
    }
    .is-corporate .bos-modal-eyebrow {
      color: #8b7fd1;
    }
    .bos-modal-title {
      font-family: 'Syne', serif;
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.02em;
      color: #fff;
      margin: 0;
    }
    .bos-modal-subtitle {
      font-size: 0.875rem;
      color: rgba(240, 237, 232, 0.65);
      margin-top: 0.5rem;
      line-height: 1.5;
    }
    .bos-modal-body {
      padding: 1.5rem 2rem 2rem;
    }
    .bos-step-indicator {
      display: flex;
      gap: 6px;
      margin-bottom: 1.5rem;
    }
    .bos-step-dot {
      flex: 1;
      height: 3px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 2px;
      transition: background 0.3s ease;
    }
    .bos-step-dot.active {
      background: #e84b2a;
    }
    .is-corporate .bos-step-dot.active {
      background: #8b7fd1;
    }
    .bos-step-section {
      margin-bottom: 1.5rem;
    }
    .bos-step-label {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(240, 237, 232, 0.6);
      margin-bottom: 0.75rem;
    }
    .bos-cohort-options {
      display: grid;
      gap: 0.75rem;
    }
    .bos-cohort-option {
      display: flex;
      flex-direction: column;
      padding: 1rem 1.25rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: left;
    }
    .bos-cohort-option:hover:not(:disabled) {
      border-color: rgba(232, 75, 42, 0.4);
      background: rgba(232, 75, 42, 0.05);
    }
    .is-corporate .bos-cohort-option:hover:not(:disabled) {
      border-color: rgba(139, 127, 209, 0.4);
      background: rgba(139, 127, 209, 0.05);
    }
    .bos-cohort-option.selected {
      border-color: #e84b2a;
      background: rgba(232, 75, 42, 0.08);
    }
    .is-corporate .bos-cohort-option.selected {
      border-color: #8b7fd1;
      background: rgba(139, 127, 209, 0.08);
    }
    .bos-cohort-option:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .bos-cohort-city {
      font-family: 'Syne', serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: #fff;
    }
    .bos-cohort-dates {
      font-size: 0.875rem;
      color: rgba(240, 237, 232, 0.6);
      margin-top: 2px;
    }
    .bos-cohort-availability {
      font-size: 0.75rem;
      color: rgba(240, 237, 232, 0.5);
      margin-top: 8px;
    }
    .bos-payment-options {
      display: grid;
      gap: 0.75rem;
    }
    .bos-payment-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: left;
    }
    .bos-payment-option:hover {
      border-color: rgba(232, 75, 42, 0.4);
      background: rgba(232, 75, 42, 0.05);
    }
    .bos-payment-option.selected {
      border-color: #e84b2a;
      background: rgba(232, 75, 42, 0.08);
    }
    .bos-payment-label {
      font-weight: 500;
      color: #fff;
      font-size: 0.95rem;
    }
    .bos-payment-sub {
      font-size: 0.75rem;
      color: rgba(240, 237, 232, 0.55);
      margin-top: 2px;
    }
    .bos-payment-amount {
      font-family: 'Syne', serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: #fff;
    }
    .bos-form-grid {
      display: grid;
      gap: 1rem;
    }
    .bos-form-grid-2 {
      grid-template-columns: 1fr 1fr;
    }
    @media (max-width: 480px) {
      .bos-form-grid-2 {
        grid-template-columns: 1fr;
      }
    }
    .bos-field {
      display: flex;
      flex-direction: column;
    }
    .bos-field-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: rgba(240, 237, 232, 0.7);
      margin-bottom: 0.4rem;
      letter-spacing: 0.02em;
    }
    .bos-field-label .req {
      color: #e84b2a;
    }
    .is-corporate .bos-field-label .req {
      color: #8b7fd1;
    }
    .bos-input,
    .bos-textarea,
    .bos-select {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      font-family: inherit;
      color: #fff;
      transition: all 0.15s ease;
      box-sizing: border-box;
    }
    .bos-input:focus,
    .bos-textarea:focus,
    .bos-select:focus {
      outline: none;
      border-color: #e84b2a;
      background: rgba(255, 255, 255, 0.06);
    }
    .is-corporate .bos-input:focus,
    .is-corporate .bos-textarea:focus,
    .is-corporate .bos-select:focus {
      border-color: #8b7fd1;
    }
    .bos-textarea {
      min-height: 80px;
      resize: vertical;
    }
    .bos-checkboxes {
      display: grid;
      gap: 0.5rem;
    }
    .bos-checkbox {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .bos-checkbox:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    .bos-checkbox input {
      margin-top: 2px;
      accent-color: #8b7fd1;
    }
    .bos-checkbox-label {
      flex: 1;
      font-size: 0.875rem;
      color: rgba(240, 237, 232, 0.85);
      line-height: 1.4;
    }
    .bos-button-row {
      display: flex;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    .bos-btn {
      flex: 1;
      padding: 0.875rem 1.25rem;
      border-radius: 999px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
      border: none;
    }
    .bos-btn-primary {
      background: #e84b2a;
      color: #fff;
    }
    .is-corporate .bos-btn-primary {
      background: #8b7fd1;
    }
    .bos-btn-primary:hover:not(:disabled) {
      background: #d63a1f;
      transform: translateY(-1px);
    }
    .is-corporate .bos-btn-primary:hover:not(:disabled) {
      background: #7969c4;
    }
    .bos-btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .bos-btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      color: rgba(240, 237, 232, 0.8);
      flex: 0 0 auto;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
    .bos-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    .bos-error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 1rem;
      line-height: 1.4;
    }
    .bos-summary {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 1rem 1.25rem;
      margin-bottom: 1rem;
    }
    .bos-summary-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.4rem 0;
      font-size: 0.875rem;
    }
    .bos-summary-row:not(:last-child) {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .bos-summary-label {
      color: rgba(240, 237, 232, 0.65);
    }
    .bos-summary-value {
      color: #fff;
      font-weight: 500;
    }
    .bos-summary-total {
      font-family: 'Syne', serif;
      font-size: 1.125rem;
      color: #fff;
      font-weight: 700;
    }
    .bos-success {
      text-align: center;
      padding: 1.5rem 0;
    }
    .bos-success-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }
    .bos-success-title {
      font-family: 'Syne', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
      margin: 0 0 0.75rem;
    }
    .bos-success-message {
      font-size: 0.95rem;
      color: rgba(240, 237, 232, 0.75);
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }
    .bos-loading {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: bos-spin 0.6s linear infinite;
      margin-right: 0.5rem;
      vertical-align: -2px;
    }
    @keyframes bos-spin {
      to { transform: rotate(360deg); }
    }
    .bos-discount-badge {
      display: inline-block;
      background: rgba(232, 75, 42, 0.15);
      color: #e84b2a;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-left: 0.5rem;
    }
    .is-corporate .bos-discount-badge {
      background: rgba(139, 127, 209, 0.15);
      color: #8b7fd1;
    }
    .bos-help-text {
      font-size: 0.75rem;
      color: rgba(240, 237, 232, 0.5);
      margin-top: 0.4rem;
      line-height: 1.4;
    }
  `;

  // ─── Modal state and DOM ────────────────────────────────────

  let modalEl = null;
  let state = null; // current modal state object

  function injectStyles() {
    if (document.getElementById('bos-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'bos-modal-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  function closeModal() {
    if (modalEl) {
      modalEl.remove();
      modalEl = null;
    }
    state = null;
    document.body.style.overflow = '';
  }

  function renderModal(html, isCorporate) {
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.className = 'bos-modal-overlay';
      modalEl.addEventListener('click', e => {
        if (e.target === modalEl) closeModal();
      });
      document.body.appendChild(modalEl);
      document.body.style.overflow = 'hidden';
    }
    const corpClass = isCorporate ? 'is-corporate' : '';
    modalEl.innerHTML = `
      <div class="bos-modal-panel ${corpClass}">
        <button class="bos-modal-close" aria-label="Close" data-action="close">×</button>
        ${html}
      </div>
    `;
    modalEl.querySelector('[data-action="close"]').addEventListener('click', closeModal);
  }

  function renderError(msg) {
    return `<div class="bos-error">${escapeHtml(msg)}</div>`;
  }

  function stepDots(current, total, isCorporate) {
    let dots = '';
    for (let i = 1; i <= total; i++) {
      dots += `<div class="bos-step-dot${i <= current ? ' active' : ''}"></div>`;
    }
    return `<div class="bos-step-indicator">${dots}</div>`;
  }

  // ─── Individual flow ────────────────────────────────────────

  function renderIndividualStep1() {
    const earlyBird = isEarlyBird();
    const tierLabel = earlyBird ? 'Early-bird pricing' : 'Standard pricing';
    const fullPrice = earlyBird ? PRICES.individual_early_bird : PRICES.individual_standard;
    const instalPrice = earlyBird ? PRICES.individual_instalment_early_bird : PRICES.individual_instalment_standard;

    let cohortHtml = '';
    Object.entries(COHORTS).forEach(([key, cohort]) => {
      const selected = state.cohortKey === key ? 'selected' : '';
      cohortHtml += `
        <button type="button" class="bos-cohort-option ${selected}" data-action="select-cohort" data-cohort="${key}">
          <div class="bos-cohort-city">${cohort.label}</div>
          <div class="bos-cohort-dates">${cohort.dates}</div>
          <div class="bos-cohort-availability">${cohort.seatsTotal} places · early-bird until 31 August 2026</div>
        </button>
      `;
    });

    renderModal(`
      <div class="bos-modal-header">
        <div class="bos-modal-eyebrow">${escapeHtml(tierLabel)}</div>
        <h2 class="bos-modal-title">Choose your cohort</h2>
        <p class="bos-modal-subtitle">Two-day Performance Reset plus an 8-week structured integration phase.</p>
      </div>
      <div class="bos-modal-body">
        ${stepDots(1, 3, false)}
        <div class="bos-step-section">
          <div class="bos-step-label">Step 1 of 3 · Cohort</div>
          <div class="bos-cohort-options">${cohortHtml}</div>
        </div>
        <div class="bos-button-row">
          <button type="button" class="bos-btn bos-btn-primary" data-action="next-cohort" ${state.cohortKey ? '' : 'disabled'}>Continue</button>
        </div>
      </div>
    `, false);

    modalEl.querySelectorAll('[data-action="select-cohort"]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.cohortKey = btn.dataset.cohort;
        renderIndividualStep1();
      });
    });
    modalEl.querySelector('[data-action="next-cohort"]').addEventListener('click', () => {
      if (!state.cohortKey) return;
      state.step = 2;
      renderIndividualStep2();
    });
  }

  function renderIndividualStep2() {
    const earlyBird = isEarlyBird();
    const fullPrice = earlyBird ? PRICES.individual_early_bird : PRICES.individual_standard;
    const instalPrice = earlyBird ? PRICES.individual_instalment_early_bird : PRICES.individual_instalment_standard;
    const cohort = COHORTS[state.cohortKey];

    const fullSelected = state.instalment === false ? 'selected' : '';
    const instalSelected = state.instalment === true ? 'selected' : '';

    renderModal(`
      <div class="bos-modal-header">
        <div class="bos-modal-eyebrow">${escapeHtml(cohort.label)} cohort</div>
        <h2 class="bos-modal-title">Choose your payment</h2>
        <p class="bos-modal-subtitle">Full payment now or split into 5 monthly instalments, no surcharge.</p>
      </div>
      <div class="bos-modal-body">
        ${stepDots(2, 3, false)}
        <div class="bos-step-section">
          <div class="bos-step-label">Step 2 of 3 · Payment</div>
          <div class="bos-payment-options">
            <button type="button" class="bos-payment-option ${fullSelected}" data-action="select-payment" data-instalment="false">
              <div>
                <div class="bos-payment-label">Pay in full</div>
                <div class="bos-payment-sub">One charge today</div>
              </div>
              <div class="bos-payment-amount">${formatZar(fullPrice)}</div>
            </button>
            <button type="button" class="bos-payment-option ${instalSelected}" data-action="select-payment" data-instalment="true">
              <div>
                <div class="bos-payment-label">5 monthly instalments</div>
                <div class="bos-payment-sub">Today, then monthly for 4 months</div>
              </div>
              <div class="bos-payment-amount">${formatZar(instalPrice)}<span style="font-size:0.7rem;color:rgba(240,237,232,0.55);font-weight:400">/mo × 5</span></div>
            </button>
          </div>
        </div>
        <div class="bos-button-row">
          <button type="button" class="bos-btn bos-btn-secondary" data-action="back">Back</button>
          <button type="button" class="bos-btn bos-btn-primary" data-action="next-payment" ${state.instalment !== null ? '' : 'disabled'}>Continue</button>
        </div>
      </div>
    `, false);

    modalEl.querySelectorAll('[data-action="select-payment"]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.instalment = btn.dataset.instalment === 'true';
        renderIndividualStep2();
      });
    });
    modalEl.querySelector('[data-action="back"]').addEventListener('click', () => {
      state.step = 1;
      renderIndividualStep1();
    });
    modalEl.querySelector('[data-action="next-payment"]').addEventListener('click', () => {
      if (state.instalment === null) return;
      state.step = 3;
      renderIndividualStep3();
    });
  }

  function renderIndividualStep3() {
    const cohort = COHORTS[state.cohortKey];
    const earlyBird = isEarlyBird();
    const fullPrice = earlyBird ? PRICES.individual_early_bird : PRICES.individual_standard;
    const errorHtml = state.error ? renderError(state.error) : '';

    renderModal(`
      <div class="bos-modal-header">
        <div class="bos-modal-eyebrow">${escapeHtml(cohort.label)} · ${state.instalment ? '5 monthly instalments' : 'Full payment'}</div>
        <h2 class="bos-modal-title">Your details</h2>
        <p class="bos-modal-subtitle">We'll send confirmation, the onboarding call link, and pre-weekend reading to this email.</p>
      </div>
      <div class="bos-modal-body">
        ${stepDots(3, 3, false)}
        ${errorHtml}
        <div class="bos-step-section">
          <div class="bos-form-grid">
            <div class="bos-field">
              <label class="bos-field-label">Full name <span class="req">*</span></label>
              <input class="bos-input" type="text" name="full_name" value="${escapeHtml(state.attendee.full_name || '')}" required>
            </div>
            <div class="bos-field">
              <label class="bos-field-label">Email <span class="req">*</span></label>
              <input class="bos-input" type="email" name="email" value="${escapeHtml(state.attendee.email || '')}" required>
            </div>
            <div class="bos-form-grid bos-form-grid-2">
              <div class="bos-field">
                <label class="bos-field-label">Mobile (optional)</label>
                <input class="bos-input" type="tel" name="phone" value="${escapeHtml(state.attendee.phone || '')}">
              </div>
              <div class="bos-field">
                <label class="bos-field-label">Role (optional)</label>
                <input class="bos-input" type="text" name="role" value="${escapeHtml(state.attendee.role || '')}">
              </div>
            </div>
            <div class="bos-field">
              <label class="bos-field-label">Organisation (optional)</label>
              <input class="bos-input" type="text" name="organisation" value="${escapeHtml(state.attendee.organisation || '')}">
              <div class="bos-help-text">Useful for our records, especially if your employer is contributing toward the cost.</div>
            </div>
          </div>
        </div>
        <div class="bos-summary">
          <div class="bos-summary-row">
            <span class="bos-summary-label">${escapeHtml(cohort.label)} cohort</span>
            <span class="bos-summary-value">${escapeHtml(cohort.dates.replace(/Saturday |Sunday /g, '').replace(/2026/, ''))}</span>
          </div>
          <div class="bos-summary-row">
            <span class="bos-summary-label">${state.instalment ? 'Total commitment' : 'Total today'}</span>
            <span class="bos-summary-total">${formatZar(fullPrice)}</span>
          </div>
        </div>
        <div class="bos-button-row">
          <button type="button" class="bos-btn bos-btn-secondary" data-action="back">Back</button>
          <button type="button" class="bos-btn bos-btn-primary" data-action="submit">Continue to payment</button>
        </div>
      </div>
    `, false);

    // Bind form fields to state
    modalEl.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', e => {
        state.attendee[input.name] = input.value;
      });
    });
    modalEl.querySelector('[data-action="back"]').addEventListener('click', () => {
      state.step = 2;
      renderIndividualStep2();
    });
    modalEl.querySelector('[data-action="submit"]').addEventListener('click', submitIndividual);
  }

  async function submitIndividual() {
    state.error = null;

    // Validate
    if (!state.attendee.full_name || state.attendee.full_name.trim().length < 2) {
      state.error = 'Please enter your full name.';
      renderIndividualStep3();
      return;
    }
    if (!validEmail(state.attendee.email || '')) {
      state.error = 'Please enter a valid email address.';
      renderIndividualStep3();
      return;
    }

    const submitBtn = modalEl.querySelector('[data-action="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="bos-loading"></span>Reserving your place...';

    const cohort = COHORTS[state.cohortKey];
    const payload = {
      tour_slug: TOUR_SLUG,
      cohort_id: cohort.id,
      audience_type: 'individual',
      instalment_plan: state.instalment === true,
      attendee: {
        full_name: state.attendee.full_name.trim(),
        email: state.attendee.email.trim().toLowerCase(),
        phone: state.attendee.phone || undefined,
        role: state.attendee.role || undefined,
        organisation: state.attendee.organisation || undefined,
      },
      utm: getUtmParams(),
      referrer: getReferrer(),
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-tour-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        state.error = data.error || `Server error (${res.status}). Please try again or email hello@burnout-os.app.`;
        renderIndividualStep3();
        return;
      }
      if (!data.checkout_url) {
        state.error = 'Server did not return a checkout URL. Please email hello@burnout-os.app.';
        renderIndividualStep3();
        return;
      }

      // Show "redirecting to Stripe" message
      renderModal(`
        <div class="bos-modal-header">
          <div class="bos-modal-eyebrow">Reservation created</div>
          <h2 class="bos-modal-title">Redirecting to Stripe...</h2>
        </div>
        <div class="bos-modal-body">
          <p style="text-align:center;color:rgba(240,237,232,0.75);line-height:1.6;padding:1.5rem 0">
            <span class="bos-loading"></span>Taking you to secure payment.
          </p>
        </div>
      `, false);

      setTimeout(() => {
        window.location.href = data.checkout_url;
      }, 600);
    } catch (err) {
      state.error = `Network error: ${err.message}. Please check your connection and try again.`;
      renderIndividualStep3();
    }
  }

  // ─── Corporate flow ─────────────────────────────────────────

  function renderCorporateStep1() {
    let cohortHtml = '';
    Object.entries(COHORTS).forEach(([key, cohort]) => {
      const selected = state.cohortKey === key ? 'selected' : '';
      cohortHtml += `
        <button type="button" class="bos-cohort-option ${selected}" data-action="select-cohort" data-cohort="${key}">
          <div class="bos-cohort-city">${cohort.label}</div>
          <div class="bos-cohort-dates">${cohort.dates}</div>
          <div class="bos-cohort-availability">${cohort.seatsTotal} total places</div>
        </button>
      `;
    });

    renderModal(`
      <div class="bos-modal-header">
        <div class="bos-modal-eyebrow">Corporate places</div>
        <h2 class="bos-modal-title">Choose your cohort</h2>
        <p class="bos-modal-subtitle">Reserve seats for your team. We'll send a proforma invoice within one business day.</p>
      </div>
      <div class="bos-modal-body">
        ${stepDots(1, 4, true)}
        <div class="bos-step-section">
          <div class="bos-step-label">Step 1 of 4 · Cohort</div>
          <div class="bos-cohort-options">${cohortHtml}</div>
        </div>
        <div class="bos-button-row">
          <button type="button" class="bos-btn bos-btn-primary" data-action="next" ${state.cohortKey ? '' : 'disabled'}>Continue</button>
        </div>
      </div>
    `, true);

    modalEl.querySelectorAll('[data-action="select-cohort"]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.cohortKey = btn.dataset.cohort;
        renderCorporateStep1();
      });
    });
    modalEl.querySelector('[data-action="next"]').addEventListener('click', () => {
      if (!state.cohortKey) return;
      state.step = 2;
      renderCorporateStep2();
    });
  }

  function renderCorporateStep2() {
    const cohort = COHORTS[state.cohortKey];
    const places = state.places || 3;
    const discount = computeCorporateDiscount(places);
    const total = computeCorporateTotal(places);
    const subtotal = places * PRICES.corporate_per_seat;
    const discountAmount = subtotal - total;

    renderModal(`
      <div class="bos-modal-header">
        <div class="bos-modal-eyebrow">${escapeHtml(cohort.label)} cohort</div>
        <h2 class="bos-modal-title">How many places?</h2>
        <p class="bos-modal-subtitle">3-5 places: 10% off · 6+ places: 15% off · One programme, one cohort.</p>
      </div>
      <div class="bos-modal-body">
        ${stepDots(2, 4, true)}
        <div class="bos-step-section">
          <div class="bos-step-label">Step 2 of 4 · Places</div>
          <div class="bos-field">
            <label class="bos-field-label">Number of places <span class="req">*</span></label>
            <input class="bos-input" type="number" name="places" min="1" max="${cohort.seatsTotal}" value="${places}" required>
          </div>
        </div>
        <div class="bos-summary">
          <div class="bos-summary-row">
            <span class="bos-summary-label">${places} place${places > 1 ? 's' : ''} × ${formatZar(PRICES.corporate_per_seat)}</span>
            <span class="bos-summary-value">${formatZar(subtotal)}</span>
          </div>
          ${discount > 0 ? `
            <div class="bos-summary-row">
              <span class="bos-summary-label">Tier discount <span class="bos-discount-badge">${discount}% off</span></span>
              <span class="bos-summary-value">−${formatZar(discountAmount)}</span>
            </div>
          ` : ''}
          <div class="bos-summary-row">
            <span class="bos-summary-label">Total (excl. VAT)</span>
            <span class="bos-summary-total">${formatZar(total)}</span>
          </div>
        </div>
        <div class="bos-button-row">
          <button type="button" class="bos-btn bos-btn-secondary" data-action="back">Back</button>
          <button type="button" class="bos-btn bos-btn-primary" data-action="next">Continue</button>
        </div>
      </div>
    `, true);

    const placesInput = modalEl.querySelector('input[name="places"]');
    placesInput.addEventListener('input', () => {
      const v = parseInt(placesInput.value, 10);
      if (Number.isInteger(v) && v >= 1 && v <= cohort.seatsTotal) {
        state.places = v;
        renderCorporateStep2();
        // Re-focus the input after re-render
        const newInput = modalEl.querySelector('input[name="places"]');
        if (newInput) {
          newInput.focus();
          newInput.setSelectionRange(newInput.value.length, newInput.value.length);
        }
      }
    });
    modalEl.querySelector('[data-action="back"]').addEventListener('click', () => {
      state.step = 1;
      renderCorporateStep1();
    });
    modalEl.querySelector('[data-action="next"]').addEventListener('click', () => {
      state.step = 3;
      renderCorporateStep3();
    });
  }

  function renderCorporateStep3() {
    const cohort = COHORTS[state.cohortKey];
    const errorHtml = state.error ? renderError(state.error) : '';

    renderModal(`
      <div class="bos-modal-header">
        <div class="bos-modal-eyebrow">${escapeHtml(cohort.label)} · ${state.places} place${state.places > 1 ? 's' : ''}</div>
        <h2 class="bos-modal-title">Company details</h2>
        <p class="bos-modal-subtitle">Used on the invoice. We can include B-BBEE / SDL documentation if needed.</p>
      </div>
      <div class="bos-modal-body">
        ${stepDots(3, 4, true)}
        ${errorHtml}
        <div class="bos-step-section">
          <div class="bos-form-grid">
            <div class="bos-field">
              <label class="bos-field-label">Company name <span class="req">*</span></label>
              <input class="bos-input" type="text" name="company_name" value="${escapeHtml(state.company.name || '')}" required>
            </div>
            <div class="bos-form-grid bos-form-grid-2">
              <div class="bos-field">
                <label class="bos-field-label">VAT number (optional)</label>
                <input class="bos-input" type="text" name="vat" value="${escapeHtml(state.company.vat || '')}">
              </div>
              <div class="bos-field">
                <label class="bos-field-label">PO number (optional)</label>
                <input class="bos-input" type="text" name="po" value="${escapeHtml(state.company.po || '')}">
              </div>
            </div>
            <div class="bos-field">
              <label class="bos-field-label">Billing email <span class="req">*</span></label>
              <input class="bos-input" type="email" name="billing_email" value="${escapeHtml(state.company.billing_email || '')}" required>
              <div class="bos-help-text">The email address that should receive the invoice.</div>
            </div>
            <div class="bos-field">
              <label class="bos-field-label">Billing contact name (optional)</label>
              <input class="bos-input" type="text" name="billing_contact" value="${escapeHtml(state.company.billing_contact || '')}">
            </div>
          </div>
        </div>
        <div class="bos-button-row">
          <button type="button" class="bos-btn bos-btn-secondary" data-action="back">Back</button>
          <button type="button" class="bos-btn bos-btn-primary" data-action="next">Continue</button>
        </div>
      </div>
    `, true);

    modalEl.querySelectorAll('input').forEach(input => {
      const fieldMap = {
        company_name: 'name', vat: 'vat', po: 'po',
        billing_email: 'billing_email', billing_contact: 'billing_contact',
      };
      input.addEventListener('input', () => {
        state.company[fieldMap[input.name]] = input.value;
      });
    });
    modalEl.querySelector('[data-action="back"]').addEventListener('click', () => {
      state.step = 2;
      renderCorporateStep2();
    });
    modalEl.querySelector('[data-action="next"]').addEventListener('click', () => {
      // Validate company step
      state.error = null;
      if (!state.company.name || state.company.name.trim().length < 2) {
        state.error = 'Please enter the company name.';
        renderCorporateStep3();
        return;
      }
      if (!validEmail(state.company.billing_email || '')) {
        state.error = 'Please enter a valid billing email.';
        renderCorporateStep3();
        return;
      }
      state.step = 4;
      renderCorporateStep4();
    });
  }

  function renderCorporateStep4() {
    const cohort = COHORTS[state.cohortKey];
    const errorHtml = state.error ? renderError(state.error) : '';

    renderModal(`
      <div class="bos-modal-header">
        <div class="bos-modal-eyebrow">${escapeHtml(state.company.name)}</div>
        <h2 class="bos-modal-title">Your details</h2>
        <p class="bos-modal-subtitle">So Werner can speak with you directly while preparing the invoice.</p>
      </div>
      <div class="bos-modal-body">
        ${stepDots(4, 4, true)}
        ${errorHtml}
        <div class="bos-step-section">
          <div class="bos-step-label">Step 4 of 4 · Requestor</div>
          <div class="bos-form-grid">
            <div class="bos-form-grid bos-form-grid-2">
              <div class="bos-field">
                <label class="bos-field-label">Your name <span class="req">*</span></label>
                <input class="bos-input" type="text" name="name" value="${escapeHtml(state.requestor.name || '')}" required>
              </div>
              <div class="bos-field">
                <label class="bos-field-label">Your email <span class="req">*</span></label>
                <input class="bos-input" type="email" name="email" value="${escapeHtml(state.requestor.email || '')}" required>
              </div>
            </div>
            <div class="bos-form-grid bos-form-grid-2">
              <div class="bos-field">
                <label class="bos-field-label">Your role (optional)</label>
                <input class="bos-input" type="text" name="role" value="${escapeHtml(state.requestor.role || '')}">
              </div>
              <div class="bos-field">
                <label class="bos-field-label">Phone (optional)</label>
                <input class="bos-input" type="tel" name="phone" value="${escapeHtml(state.requestor.phone || '')}">
              </div>
            </div>
            <div class="bos-field">
              <label class="bos-field-label">Documents (optional)</label>
              <div class="bos-checkboxes">
                <label class="bos-checkbox">
                  <input type="checkbox" name="bbee" ${state.docs.bbee ? 'checked' : ''}>
                  <span class="bos-checkbox-label">B-BBEE affidavit / certificate</span>
                </label>
                <label class="bos-checkbox">
                  <input type="checkbox" name="sdl" ${state.docs.sdl ? 'checked' : ''}>
                  <span class="bos-checkbox-label">SDL coordinator letter (for skills levy)</span>
                </label>
                <label class="bos-checkbox">
                  <input type="checkbox" name="briefing" ${state.docs.briefing ? 'checked' : ''}>
                  <span class="bos-checkbox-label">Clinical briefing document (2-page) for procurement</span>
                </label>
              </div>
            </div>
            <div class="bos-field">
              <label class="bos-field-label">Notes (optional)</label>
              <textarea class="bos-textarea" name="notes">${escapeHtml(state.notes || '')}</textarea>
            </div>
          </div>
        </div>
        <div class="bos-button-row">
          <button type="button" class="bos-btn bos-btn-secondary" data-action="back">Back</button>
          <button type="button" class="bos-btn bos-btn-primary" data-action="submit">Request quote</button>
        </div>
      </div>
    `, true);

    // Bind text inputs
    modalEl.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]').forEach(input => {
      input.addEventListener('input', () => {
        state.requestor[input.name] = input.value;
      });
    });
    // Bind checkboxes
    modalEl.querySelectorAll('input[type="checkbox"]').forEach(input => {
      input.addEventListener('change', () => {
        state.docs[input.name] = input.checked;
      });
    });
    // Bind textarea
    const textarea = modalEl.querySelector('textarea');
    if (textarea) {
      textarea.addEventListener('input', () => {
        state.notes = textarea.value;
      });
    }
    modalEl.querySelector('[data-action="back"]').addEventListener('click', () => {
      state.step = 3;
      renderCorporateStep3();
    });
    modalEl.querySelector('[data-action="submit"]').addEventListener('click', submitCorporate);
  }

  async function submitCorporate() {
    state.error = null;

    if (!state.requestor.name || state.requestor.name.trim().length < 2) {
      state.error = 'Please enter your name.';
      renderCorporateStep4();
      return;
    }
    if (!validEmail(state.requestor.email || '')) {
      state.error = 'Please enter a valid email address.';
      renderCorporateStep4();
      return;
    }

    const submitBtn = modalEl.querySelector('[data-action="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="bos-loading"></span>Sending request...';

    const cohort = COHORTS[state.cohortKey];
    const payload = {
      tour_slug: TOUR_SLUG,
      cohort_id: cohort.id,
      places_count: state.places,
      company_name: state.company.name.trim(),
      company_vat_number: state.company.vat || undefined,
      billing_email: state.company.billing_email.trim().toLowerCase(),
      billing_contact_name: state.company.billing_contact || undefined,
      po_number: state.company.po || undefined,
      requestor_name: state.requestor.name.trim(),
      requestor_email: state.requestor.email.trim().toLowerCase(),
      requestor_role: state.requestor.role || undefined,
      requestor_phone: state.requestor.phone || undefined,
      needs_b_bbee_doc: !!state.docs.bbee,
      needs_sdl_doc: !!state.docs.sdl,
      needs_clinical_briefing: !!state.docs.briefing,
      notes: state.notes || undefined,
      utm: getUtmParams(),
      referrer: getReferrer(),
    };

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/request-corporate-quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        state.error = data.error || `Server error (${res.status}). Please try again or email hello@burnout-os.app.`;
        renderCorporateStep4();
        return;
      }

      const total = formatZar((data.total_amount_cents || 0) / 100);
      const heldUntil = data.held_until ? new Date(data.held_until).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

      renderModal(`
        <div class="bos-modal-header">
          <div class="bos-modal-eyebrow">Quote received</div>
          <h2 class="bos-modal-title">Thanks, ${escapeHtml(state.requestor.name.split(' ')[0])}.</h2>
        </div>
        <div class="bos-modal-body">
          <div class="bos-success">
            <div class="bos-success-icon">✓</div>
            <p class="bos-success-message">
              We've received your request for <strong style="color:#fff">${state.places} place${state.places > 1 ? 's' : ''} in the ${escapeHtml(cohort.label)} cohort</strong>.
            </p>
            <div class="bos-summary" style="text-align:left;margin-bottom:1.5rem">
              <div class="bos-summary-row">
                <span class="bos-summary-label">Quote total (excl. VAT)</span>
                <span class="bos-summary-total">${total}</span>
              </div>
              ${heldUntil ? `
                <div class="bos-summary-row">
                  <span class="bos-summary-label">Places held until</span>
                  <span class="bos-summary-value">${escapeHtml(heldUntil)}</span>
                </div>
              ` : ''}
            </div>
            <p class="bos-success-message" style="margin-bottom:1rem">
              Werner will review your request and email a proforma invoice within one business day. We've also sent a confirmation to ${escapeHtml(state.requestor.email)}.
            </p>
          </div>
          <div class="bos-button-row">
            <button type="button" class="bos-btn bos-btn-primary" data-action="close">Done</button>
          </div>
        </div>
      `, true);
      modalEl.querySelector('[data-action="close"]').addEventListener('click', closeModal);
    } catch (err) {
      state.error = `Network error: ${err.message}. Please check your connection and try again.`;
      renderCorporateStep4();
    }
  }

  // ─── Audience-picker (for hub page) ─────────────────────────

  function renderAudiencePicker() {
    renderModal(`
      <div class="bos-modal-header">
        <div class="bos-modal-eyebrow">BurnoutOS Programme · SA 2026</div>
        <h2 class="bos-modal-title">How are you joining?</h2>
        <p class="bos-modal-subtitle">Two paths. Same programme.</p>
      </div>
      <div class="bos-modal-body">
        <div class="bos-cohort-options">
          <button type="button" class="bos-cohort-option" data-action="pick-individual">
            <div class="bos-cohort-city">As an individual</div>
            <div class="bos-cohort-dates">Self-paying · Pay now or 5 monthly instalments</div>
            <div class="bos-cohort-availability">Early-bird R8,950 or 5 × R1,890 · Standard R10,950</div>
          </button>
          <button type="button" class="bos-cohort-option" data-action="pick-corporate">
            <div class="bos-cohort-city">For my team</div>
            <div class="bos-cohort-dates">Invoice billing · 3+ places get tier discounts</div>
            <div class="bos-cohort-availability">R12,950 per place (10–15% off for teams)</div>
          </button>
        </div>
      </div>
    `, false);
    modalEl.querySelector('[data-action="pick-individual"]').addEventListener('click', () => startIndividual());
    modalEl.querySelector('[data-action="pick-corporate"]').addEventListener('click', () => startCorporate());
  }

  // ─── Entry points ───────────────────────────────────────────

  function startIndividual(opts = {}) {
    state = {
      audience: 'individual',
      step: 1,
      cohortKey: opts.cohortKey || null,
      instalment: null,
      attendee: {},
      error: null,
    };
    renderIndividualStep1();
  }

  function startCorporate(opts = {}) {
    state = {
      audience: 'corporate',
      step: 1,
      cohortKey: opts.cohortKey || null,
      places: opts.places || 3,
      company: {},
      requestor: {},
      docs: {},
      notes: '',
      error: null,
    };
    renderCorporateStep1();
  }

  // ─── Public API ─────────────────────────────────────────────

  function openTourModal(opts = {}) {
    injectStyles();
    if (opts.audience === 'individual') {
      startIndividual(opts);
    } else if (opts.audience === 'corporate') {
      startCorporate(opts);
    } else {
      // Hub page: ask which path
      state = { audience: null, step: 0, error: null };
      renderAudiencePicker();
    }
  }

  // Escape key closes modal
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modalEl) closeModal();
  });

  // Expose globally
  window.openTourModal = openTourModal;

  // Auto-bind to elements with data-tour-modal attribute, e.g.
  //   <button data-tour-modal="individual">Reserve early-bird place</button>
  //   <button data-tour-modal="corporate">Reserve corporate places</button>
  //   <button data-tour-modal="hub">Reserve your place</button>
  document.addEventListener('click', e => {
    const target = e.target.closest('[data-tour-modal]');
    if (!target) return;
    e.preventDefault();
    const audience = target.dataset.tourModal;
    if (audience === 'individual' || audience === 'corporate') {
      openTourModal({ audience });
    } else {
      openTourModal({});
    }
  });
})();
