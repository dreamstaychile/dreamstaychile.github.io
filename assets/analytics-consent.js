/* Dream Stay Chile — analítica con consentimiento expreso.
   ID de GA4: G-VQEXPFT5BT. No cargar gtag antes de la aceptación. */
(() => {
  'use strict';
  const MEASUREMENT_ID = 'G-VQEXPFT5BT';
  const CONSENT_KEY = 'dreamstay-analytics-consent-v1';
  const PATH = location.pathname;
  const MARKET = PATH.startsWith('/administracion-airbnb/')
    ? (PATH.split('/').filter(Boolean)[1] || 'directorio') : 'general';
  const safeFields = new Set(['lead_market','form_id','form_step','location','property_type','source','medium','campaign','content','term','error_type']);
  let loaded = false;
  const getConsent = () => {
    try { return localStorage.getItem(CONSENT_KEY) || 'unset'; } catch { return 'unset'; }
  };
  const persistConsent = value => {
    try { localStorage.setItem(CONSENT_KEY, value); } catch {}
  };
  const track = (name, params = {}) => {
    if (getConsent() !== 'granted' || !loaded) return;
    if (!/^[a-z][a-z0-9_]{1,39}$/.test(name)) return;
    const safe = { lead_market: MARKET };
    for (const [key, value] of Object.entries(params)) {
      if (safeFields.has(key) && typeof value === 'string' && value.length <= 100)
        safe[key] = value;
      else if (safeFields.has(key) && typeof value === 'number')
        safe[key] = value;
    }
    window.gtag('event', name, safe);
  };
  const start = () => {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      send_page_view: true,
      anonymize_ip: true
    });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    document.head.appendChild(tag);
    track('property_landing_view', { lead_market: MARKET });
  };
  window.DreamStayAnalytics = { track, getConsent, measurementId: MEASUREMENT_ID };
  const addPreferences = () => {
    if (document.getElementById('ds-cookie-settings')) return;
    const btn = document.createElement('button');
    btn.id = 'ds-cookie-settings';
    btn.type = 'button';
    btn.textContent = 'Preferencias de cookies';
    btn.setAttribute('aria-label', 'Cambiar preferencias de cookies de analítica');
    btn.style.cssText = 'position:fixed;bottom:10px;left:10px;z-index:9998;background:#fff;color:#303030;border:1px solid #ccc;border-radius:30px;padding:8px 12px;font:12px system-ui;cursor:pointer;box-shadow:0 2px 12px #0002';
    btn.addEventListener('click', () => showBanner(true));
    document.body.appendChild(btn);
  };
  const showBanner = force => {
    if (!force && getConsent() !== 'unset') return;
    document.getElementById('ds-cookie-banner')?.remove();
    const dialog = document.createElement('aside');
    dialog.id = 'ds-cookie-banner';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-label', 'Consentimiento de analítica');
    dialog.style.cssText = 'position:fixed;bottom:58px;left:12px;right:12px;max-width:530px;z-index:9999;padding:18px 20px;background:#fff;color:#202124;border:1px solid #e1e1e1;border-radius:16px;box-shadow:0 12px 40px #0003;font:14px/1.5 system-ui';
    const title = document.createElement('strong');
    title.textContent = 'Tu privacidad importa';
    const message = document.createElement('p');
    message.textContent = 'Usamos Google Analytics para medir visitas y mejorar nuestro sitio solo si lo autorizas. Puedes cambiar tu decisión cuando quieras.';
    message.style.margin = '8px 0';
    const link = document.createElement('a');
    link.href = '/politica-de-privacidad.html';
    link.textContent = 'Política de privacidad';
    link.style.cssText = 'color:#d92b52;text-decoration:underline';
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;margin-top:14px';
    const button = (text, accept) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = text;
      b.style.cssText = 'border-radius:9px;padding:10px 14px;border:1px solid #ff385c;background:' + (accept ? '#ff385c;color:#fff' : '#fff;color:#b31b41') + ';font:600 14px system-ui;cursor:pointer';
      b.addEventListener('click', () => {
        const wasGranted = getConsent() === 'granted';
        persistConsent(accept ? 'granted' : 'denied');
        dialog.remove();
        if (accept) start();
        else if (wasGranted) location.reload(); // deja de enviar eventos en esta visita
      });
      return b;
    };
    actions.append(button('Rechazar analítica', false), button('Aceptar analítica', true));
    dialog.append(title, message, link, actions);
    document.body.appendChild(dialog);
  };
  const init = () => {
    addPreferences();
    if (getConsent() === 'granted') start();
    else showBanner(false);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
