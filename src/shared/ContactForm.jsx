import { useId, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { FORM_ENDPOINT } from '../config/site.js';
import { play } from '../core/sound.js';

const KEY = import.meta.env.VITE_FORM_KEY;
// Without a key the form is hidden on the live site (contact buttons remain);
// in dev it simulates a successful send so the UI can be tested.
export const formEnabled = Boolean(KEY) || import.meta.env.DEV;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = 'Please add your name.';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address.';
  if (v.message.trim().length < 10) e.message = 'A message of at least 10 characters helps me reply.';
  return e;
}

export default function ContactForm({ className = '', submitLabel = 'Send message', successTitle = 'Message sent!' }) {
  const uid = useId();
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const formRef = useRef(null);
  const successRef = useRef(null);

  if (!formEnabled) return null;

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      formRef.current?.querySelector(`[name="${Object.keys(errs)[0]}"]`)?.focus();
      return;
    }
    // Honeypot: bots fill hidden fields; quietly "succeed" without sending.
    if (form.get('botcheck')) return finish();
    setStatus('sending');
    try {
      if (!KEY) {
        await new Promise((r) => setTimeout(r, 700));
      } else {
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: KEY,
            subject: `Portfolio message from ${values.name.trim()}`,
            from_name: 'zachary.dev portfolio',
            ...values,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json.success === false) throw new Error(json.message || 'Failed');
      }
      finish();
    } catch {
      setStatus('error');
    }
  }

  function finish() {
    setStatus('success');
    setValues({ name: '', email: '', message: '' });
    play('success');
    requestAnimationFrame(() => successRef.current?.focus());
  }

  if (status === 'success') {
    return (
      <div className={`form-success ${className}`} role="status" tabIndex={-1} ref={successRef}>
        <span className="form-success__icon" aria-hidden="true">
          <Icon name="check" size={22} />
        </span>
        <h3>{successTitle}</h3>
        <p>Thanks for reaching out. I'll reply to your email within a day or two.</p>
        <button type="button" className="btn btn--ghost" onClick={() => setStatus('idle')}>
          Send another message
        </button>
      </div>
    );
  }

  const field = (k, label, props = {}) => (
    <div className={`field ${errors[k] ? 'has-error' : ''}`}>
      <label htmlFor={`${uid}-${k}`}>{label}</label>
      {k === 'message' ? (
        <textarea id={`${uid}-${k}`} name={k} rows="5" value={values[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `${uid}-${k}-err` : undefined} {...props} />
      ) : (
        <input id={`${uid}-${k}`} name={k} value={values[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `${uid}-${k}-err` : undefined} {...props} />
      )}
      {errors[k] && (
        <p className="field__error" id={`${uid}-${k}-err`}>
          {errors[k]}
        </p>
      )}
    </div>
  );

  return (
    <form ref={formRef} className={`contact-form ${className}`} onSubmit={onSubmit} noValidate>
      {field('name', 'Name', { type: 'text', autoComplete: 'name', required: true })}
      {field('email', 'Email', { type: 'email', autoComplete: 'email', required: true })}
      {field('message', 'Message', { required: true })}
      <div className="hp" aria-hidden="true">
        <label>
          Leave this empty
          <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {status === 'error' && (
        <p className="form-error" role="alert">
          Something went wrong sending your message. Please try again or use the email button.
        </p>
      )}
      <button type="submit" className="btn btn--primary" disabled={status === 'sending'} data-magnetic>
        <Icon name="arrowRight" />
        <span>{status === 'sending' ? 'Sending…' : submitLabel}</span>
      </button>
    </form>
  );
}
