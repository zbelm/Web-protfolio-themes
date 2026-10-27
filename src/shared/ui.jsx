// Small building blocks shared by all themes. Themes restyle them with CSS.
import { Fragment, useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { useApp } from '../core/AppState.jsx';
import { play } from '../core/sound.js';
import { initials, profile, resume } from './content.js';

export function ResumeButton({ className = 'btn btn--primary', label = 'Download Resume', showSize = true, icon = 'download' }) {
  const { theme } = useApp();
  if (!resume) return null;
  return (
    <a
      className={className}
      href={resume.href}
      download="Zachary-Belmonte-Resume.pdf"
      data-magnetic
      onClick={(e) => {
        play('success');
        theme?.onResumeDownload?.(e);
      }}
    >
      <Icon name={icon} />
      <span>{label}</span>
      {showSize && <span className="btn__meta">{resume.label}</span>}
    </a>
  );
}

export function ContactLinks({ className = '', btnClass = 'btn btn--ghost' }) {
  const { links } = profile;
  const items = [
    links.email && { href: links.email, icon: 'mail', label: 'Email', ext: false },
    links.linkedin && { href: links.linkedin, icon: 'linkedin', label: 'LinkedIn', ext: true },
    links.github && { href: links.github, icon: 'github', label: 'GitHub', ext: true },
  ].filter(Boolean);
  return (
    <ul className={`contact-links ${className}`}>
      {items.map((l) => (
        <li key={l.label}>
          <a className={btnClass} href={l.href} {...(l.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})} data-magnetic>
            <Icon name={l.icon} />
            <span>{l.label}</span>
            {l.ext && <span className="sr-only"> (opens in a new tab)</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function LinkedInButton({ className = 'btn btn--ghost', label = 'View my LinkedIn' }) {
  if (!profile.links.linkedin) return null;
  return (
    <a className={className} href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">
      <Icon name="linkedin" />
      <span>{label}</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function StatusBadge({ className = '' }) {
  if (!profile.openToWork || !profile.statuses.length) return null;
  return (
    <ul className={`status-list ${className}`}>
      {profile.statuses.map((s) => (
        <li key={s} className="status-badge">
          <span className="status-badge__dot" aria-hidden="true" />
          {s}
        </li>
      ))}
    </ul>
  );
}

// "open to internships (OJT) and open for commissions" for use inside a sentence.
export const statusSentence = () =>
  profile.statuses.map((s) => s.charAt(0).toLowerCase() + s.slice(1)).join(' and ');

// Cycling role line. Screen readers get the full list once; the animation is visual only.
export function RoleCycler({ roles = profile.roles, interval = 2600, className = '' }) {
  const { motionOK } = useApp();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!motionOK || roles.length < 2) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % roles.length), interval);
    return () => clearInterval(t);
  }, [motionOK, roles.length, interval]);
  return (
    <span className={`roles ${className}`}>
      <span className="sr-only">{roles.join(', ')}</span>
      <span className="roles__track" aria-hidden="true">
        {motionOK ? (
          <span key={i} className="roles__item">
            {roles[i]}
          </span>
        ) : (
          <span className="roles__item roles__item--static">{roles.slice(0, 3).join(' · ')}</span>
        )}
      </span>
    </span>
  );
}

// Splits a heading into words so themes can animate them; reads normally to assistive tech.
export function SplitWords({ text }) {
  return String(text)
    .split(' ')
    .map((w, i) => (
      <Fragment key={i}>
        {i > 0 && ' '}
        <span className="w">
          <span className="w__i">{w}</span>
        </span>
      </Fragment>
    ));
}

export function SectionHeader({ id, eyebrow, title, lead, split = false, className = '' }) {
  return (
    <header className={`section-header ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={`${id}-title`} className="section-title">
        {split ? <SplitWords text={title} /> : title}
      </h2>
      {lead && <p className="lead">{lead}</p>}
    </header>
  );
}

export function Monogram({ text, className = '' }) {
  return (
    <span className={`monogram ${className}`} aria-hidden="true">
      {initials(text)}
    </span>
  );
}

export function SampleTag({ show }) {
  if (!show || import.meta.env.PROD) return null;
  return <span className="sample-tag">Sample · dev only</span>;
}

export function ExternalLink({ href, className, children, icon = 'external' }) {
  if (!href) return null;
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      <Icon name={icon} />
      <span>{children}</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
