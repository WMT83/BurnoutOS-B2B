/*
 * attr.js - BurnoutOS attribution capture
 *
 * The ad lands a visitor on /tour with utm_* and fbclid on the query string.
 * They then click through to /register, which is a clean URL, so every
 * registration written before 22 August 2026 recorded a null utm_source and
 * paid traffic could not be attributed.
 *
 * This module captures the campaign touch once, holds it in sessionStorage for
 * the rest of the visit, and exposes it to any page that needs to send it.
 * Load it in <head> after the Meta pixel so the _fbp and _fbc cookies exist.
 */
(function () {
  var KEY = 'bos_attr';
  var UTM_KEYS = ['source', 'medium', 'campaign', 'content', 'term'];

  function readStore() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); }
    catch (e) { return null; }
  }

  function writeStore(o) {
    try { sessionStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {}
  }

  function cookie(name) {
    var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? decodeURIComponent(m[2]) : null;
  }

  var q = new URLSearchParams(window.location.search);
  var fresh = {};
  UTM_KEYS.forEach(function (k) {
    var val = q.get('utm_' + k);
    if (val) fresh[k] = val;
  });
  var fbclid = q.get('fbclid');

  var store = readStore();

  // A fresh campaign click overwrites the stored touch. Without one the
  // existing touch survives navigation, which is the whole point.
  if (Object.keys(fresh).length || fbclid) {
    store = {
      utm: fresh,
      fbclid: fbclid || null,
      landing_url: window.location.href,
      referrer: document.referrer || null,
      captured_at: new Date().toISOString()
    };
    writeStore(store);
  }

  var s = store || {};

  window.BOSAttr = {
    // Shape matches the utm object create-tour-checkout already accepts.
    utm: function () {
      var u = s.utm || {};
      return Object.keys(u).length ? u : null;
    },
    fbclid: function () { return s.fbclid || null; },
    // The pixel writes _fbc once it sees an fbclid. Read it lazily so the
    // cookie has had time to appear, and fall back to building it ourselves.
    fbc: function () {
      var c = cookie('_fbc');
      if (c) return c;
      if (!s.fbclid) return null;
      var t = s.captured_at ? Date.parse(s.captured_at) : Date.now();
      return 'fb.1.' + t + '.' + s.fbclid;
    },
    fbp: function () { return cookie('_fbp'); },
    landingUrl: function () { return s.landing_url || window.location.href; },
    referrer: function () { return s.referrer || document.referrer || null; },
    // Everything in one call, for payload building.
    payload: function () {
      return {
        utm: this.utm(),
        fbclid: this.fbclid(),
        fbc: this.fbc(),
        fbp: this.fbp(),
        landing_url: this.landingUrl(),
        referrer: this.referrer()
      };
    }
  };
})();
