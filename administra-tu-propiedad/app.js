(() => {
  'use strict';

  const form = document.querySelector('#property-form');
  const steps = [...document.querySelectorAll('.form-step')];
  const nextButton = document.querySelector('#next');
  const backButton = document.querySelector('#back');
  const submitButton = document.querySelector('#submit');
  const alertBox = document.querySelector('#form-alert');
  const success = document.querySelector('#success');
  const storageKey = 'dreamstay-property-lead-v1';
  const stepNames = ['La propiedad', 'Situación comercial', 'Equipamiento', 'Tus datos'];
  let currentStep = 1;
  let started = false;

  const analytics = (eventName, properties = {}) => {
    const safe = { ...properties };
    ['address', 'fullName', 'email', 'whatsapp', 'comments'].forEach(key => delete safe[key]);
    window.dataLayer?.push({ event: eventName, ...safe });
  };

  const getUtmData = () => {
    const query = new URLSearchParams(location.search);
    const map = { utm_source: 'source', utm_medium: 'medium', utm_campaign: 'campaign', utm_content: 'content', utm_term: 'term', gclid: 'gclid', fbclid: 'fbclid' };
    return Object.fromEntries(Object.entries(map).map(([queryKey, dataKey]) => [dataKey, query.get(queryKey) || '']).filter(([, value]) => value));
  };

  const showStep = step => {
    currentStep = step;
    steps.forEach(item => { item.hidden = Number(item.dataset.step) !== step; });
    backButton.hidden = step === 1;
    nextButton.hidden = step === 4;
    submitButton.hidden = step !== 4;
    document.querySelector('#progress-label').textContent = `Paso ${step} de 4`;
    document.querySelector('#progress-name').textContent = stepNames[step - 1];
    const progress = document.querySelector('.progress');
    progress.setAttribute('aria-valuenow', String(step));
    document.querySelector('#progress-bar').style.width = `${step * 25}%`;
    alertBox.hidden = true;
    steps[step - 1].querySelector('legend')?.focus?.();
    document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const messages = {
    location: 'Selecciona la ubicación de la propiedad.', otherLocation: 'Indica la comuna o localidad.', address: 'Ingresa la dirección de la propiedad.', propertyType: 'Selecciona el tipo de propiedad.', bedrooms: 'Selecciona el número de dormitorios.', bathrooms: 'Selecciona el número de baños.', guestCapacity: 'Selecciona la capacidad de huéspedes.', currentSituation: 'Selecciona la situación actual.', primaryGoal: 'Selecciona tu objetivo principal.', propertyCount: 'Selecciona la cantidad de propiedades.', furnishedStatus: 'Selecciona el estado de amoblado.', pool: 'Selecciona si la propiedad cuenta con piscina.', laundry: 'Selecciona una alternativa de lavadora o lavandería.', startTime: 'Selecciona cuándo te gustaría comenzar.', fullName: 'Ingresa tu nombre y apellido.', email: 'Ingresa un correo electrónico válido.', whatsapp: 'Ingresa tu número con signo + y código de país.', privacyConsent: 'Debes aceptar el uso de tus datos para continuar.'
  };

  const validateField = field => {
    const error = document.querySelector(`#${field.id}-error`);
    let valid = true;
    if (field.required && field.type === 'checkbox') valid = field.checked;
    else if (field.required) valid = Boolean(field.value.trim());
    if (valid && field.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
    if (valid && field.id === 'whatsapp') valid = /^\+[1-9]\d{7,14}$/.test(normalizePhone(field.value));
    field.setAttribute('aria-invalid', String(!valid));
    if (error) error.textContent = valid ? '' : (messages[field.id] || 'Revisa este campo.');
    return valid;
  };

  const validateStep = step => {
    if (form.location.value === 'otra') form.otherLocation.required = true;
    else form.otherLocation.required = false;
    const fields = [...steps[step - 1].querySelectorAll('[required]')];
    const valid = fields.map(validateField).every(Boolean);
    if (!valid) {
      alertBox.textContent = 'Revisa los campos señalados antes de continuar.';
      alertBox.hidden = false;
      steps[step - 1].querySelector('[aria-invalid="true"]')?.focus();
    }
    return valid;
  };

  const normalizePhone = value => value.replace(/[\s()\-\.]/g, '');

  const serialize = () => {
    const data = new FormData(form);
    const result = {};
    for (const [key, value] of data.entries()) {
      if (['platforms', 'expectations'].includes(key)) (result[key] ||= []).push(value);
      else result[key] = value;
    }
    result.privacyConsent = form.privacyConsent.checked;
    result.marketingConsent = form.marketingConsent.checked;
    result.whatsapp = normalizePhone(form.whatsapp.value);
    delete result.website;
    return result;
  };

  const persist = () => {
    const data = serialize();
    delete data.fullName; delete data.email; delete data.whatsapp; delete data.comments;
    sessionStorage.setItem(storageKey, JSON.stringify({ savedAt: Date.now(), data, utm: getUtmData() }));
  };

  const restore = () => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey));
      if (!saved || Date.now() - saved.savedAt > 2 * 60 * 60 * 1000) return sessionStorage.removeItem(storageKey);
      Object.entries(saved.data).forEach(([name, value]) => {
        const fields = [...form.querySelectorAll(`[name="${CSS.escape(name)}"]`)];
        fields.forEach(field => {
          if (field.type === 'checkbox') field.checked = Array.isArray(value) ? value.includes(field.value) : Boolean(value);
          else field.value = value;
        });
      });
    } catch { sessionStorage.removeItem(storageKey); }
  };

  const toggleConditionals = () => {
    document.querySelector('#other-location-wrap').hidden = form.location.value !== 'otra';
    document.querySelector('#other-type-wrap').hidden = form.propertyType.value !== 'otro';
    document.querySelector('#other-platform-wrap').hidden = ![...form.querySelectorAll('[name="platforms"]:checked')].some(item => item.value === 'other');
  };

  form.addEventListener('input', event => {
    if (!started) { started = true; analytics('property_form_started'); }
    if (event.target.id === 'comments') document.querySelector('#comment-count').textContent = event.target.value.length;
    if (event.target.matches('[required]')) validateField(event.target);
    toggleConditionals(); persist();
  });

  form.addEventListener('change', event => {
    if (event.target.name === 'platforms' && event.target.value === 'none' && event.target.checked) form.querySelectorAll('[name="platforms"]:not([value="none"])').forEach(item => { item.checked = false; });
    if (event.target.name === 'platforms' && event.target.value !== 'none' && event.target.checked) form.querySelector('[name="platforms"][value="none"]').checked = false;
    toggleConditionals(); persist();
  });

  nextButton.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    analytics(`property_form_step_${currentStep}_completed`, { form_step: currentStep, location: form.location.value, property_type: form.propertyType.value });
    showStep(currentStep + 1);
  });
  backButton.addEventListener('click', () => showStep(currentStep - 1));

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!validateStep(4)) return;
    if (form.website.value) return;
    analytics('property_form_step_4_completed', { form_step: 4 });
    analytics('property_form_submitted');
    const endpoint = window.DREAM_STAY_LEADS_ENDPOINT;
    if (!endpoint) {
      alertBox.textContent = 'El canal seguro de recepción aún no está configurado. Escríbenos a contacto@dreamstaychile.com mientras completamos la integración.';
      alertBox.hidden = false;
      analytics('property_form_error', { error_type: 'endpoint_not_configured' });
      return;
    }
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando…';
    const payload = { ...serialize(), honeypot: form.website.value, ...getUtmData(), referrer: document.referrer, landingPage: location.href.split('?')[0], source: getUtmData().source || 'direct', submittedAt: new Date().toISOString() };
    try {
      // text/plain evita una solicitud CORS de preflight que Google Apps Script no gestiona.
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (!result.ok) throw new Error('Lead rejected');
      sessionStorage.removeItem(storageKey);
      form.hidden = true; document.querySelector('.progress-wrap').hidden = true; success.hidden = false; success.focus();
      analytics('property_form_success');
    } catch {
      alertBox.textContent = 'No pudimos enviar la información. Revisa tu conexión e inténtalo nuevamente.';
      alertBox.hidden = false;
      analytics('property_form_error', { error_type: 'network_or_server' });
    } finally { submitButton.disabled = false; submitButton.textContent = 'Solicitar evaluación'; }
  });

  document.querySelectorAll('.track-cta').forEach(link => link.addEventListener('click', () => analytics('property_cta_clicked')));
  document.querySelector('#year').textContent = new Date().getFullYear();
  analytics('property_landing_view', getUtmData());
  restore(); toggleConditionals();
})();
