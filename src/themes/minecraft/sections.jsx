import { useEffect, useRef, useState } from 'react';
import Icon from '../../shared/Icon.jsx';
import Hero3D from '../../shared/Hero3D.jsx';
import ContactForm, { formEnabled } from '../../shared/ContactForm.jsx';
import { CertBadge, ProjectThumb, categoryLabel } from '../../shared/media.jsx';
import { CertControls, CertModal, ProjectFilters, ProjectModal, ViewAllButton } from '../../shared/details.jsx';
import { LinkedInButton, ResumeButton, RoleCycler, SampleTag, SectionHeader, statusSentence } from '../../shared/ui.jsx';
import { useApp } from '../../core/AppState.jsx';
import { useCertList, useProjectFilter } from '../../shared/hooks.js';
import { useMotion } from '../../core/useMotion.js';
import {
  about,
  achievements,
  certifications,
  formatDate,
  formatRange,
  profile,
  skillGroups,
  skillLevels,
  timeline,
  timelineTypeLabel,
} from '../../shared/content.js';
import { assemble } from './motion.js';

const loadPanorama = () => import('./panorama3d.js');

function useAssemble(ref, deps) {
  useMotion(ref, ({ gsap, root }) => assemble(gsap, root), deps);
}

/* A GUI window: light-gray bevelled panel with the dark title text. */
function Window({ title, className = '', children, ...rest }) {
  return (
    <div className={`mc-window ${className}`} data-block {...rest}>
      {title && <p className="mc-window__title">{title}</p>}
      {children}
    </div>
  );
}

/* Blocky player figure (original design) used in the player screen. */
function PlayerFigure() {
  return (
    <div className="mc-player" aria-hidden="true">
      <span className="mc-player__head">
        <i className="eye l" />
        <i className="eye r" />
        <i className="mouth" />
      </span>
      <span className="mc-player__arm l" />
      <span className="mc-player__body" />
      <span className="mc-player__arm r" />
      <span className="mc-player__leg l" />
      <span className="mc-player__leg r" />
    </div>
  );
}

/* Yellow splash text; cycles through the status lines like the game's random splashes. */
function Splash() {
  const { motionOK } = useApp();
  const [i, setI] = useState(0);
  const list = profile.statuses;
  useEffect(() => {
    if (!motionOK || list.length < 2) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % list.length), 3500);
    return () => clearInterval(t);
  }, [motionOK, list.length]);
  if (!profile.openToWork || !list.length) return null;
  return (
    <p className="mc-splash">
      <span className="sr-only">{list.join(', ')}</span>
      <span key={i} aria-hidden="true">
        {list[i]}!
      </span>
    </p>
  );
}

/* ---------------- Hero: title screen ---------------- */
function Hero() {
  const [first, ...rest] = profile.name.split(' ');
  return (
    <section id="hero" className="mc-title" aria-labelledby="hero-title">
      <Hero3D className="mc-title__panorama" load={loadPanorama} fallback={<div className="mc-pano-fallback" />} />
      <div className="mc-title__shade" aria-hidden="true" />
      <div className="container mc-title__inner">
        <h1 id="hero-title" className="mc-logo mc-in">
          <span>{first}</span> <span>{rest.join(' ')}</span>
        </h1>
        <Splash />
        <p className="mc-title__roles mc-in" style={{ '--d': '100ms' }}>
          <RoleCycler />
        </p>
        <p className="mc-title__pitch mc-in" style={{ '--d': '160ms' }}>
          {profile.pitch}
        </p>
        <nav className="mc-menu mc-in" style={{ '--d': '220ms' }} aria-label="Main menu">
          <a href="#projects" className="btn btn--block">
            View Projects
          </a>
          <a href="#contact" className="btn btn--block">
            Contact Me
          </a>
          <div className="mc-menu__row">
            <ResumeButton className="btn" label="Resume" showSize={false} />
            <a href="#about" className="btn">
              About Me
            </a>
          </div>
        </nav>
      </div>
      <p className="mc-title__corner mc-title__corner--l">{profile.brand} 1.0</p>
      <p className="mc-title__corner mc-title__corner--r">© {profile.name}</p>
    </section>
  );
}

/* ---------------- About: player screen ---------------- */
function About() {
  const ref = useRef(null);
  useAssemble(ref);
  const stats = [
    ['Class', profile.roles.slice(0, 3).join(' / ')],
    ['Location', profile.location],
    ['School', profile.school],
    ['Course', profile.course],
    ['Status', about.availability],
  ].filter(([, v]) => v);
  return (
    <section id="about" className="section mc-about" aria-labelledby="about-title" ref={ref}>
      <div className="container">
        <SectionHeader id="about" eyebrow="Player" title="About me" lead={about.headline} />
        <Window title="Player" className="mc-about__window">
          <div className="mc-about__grid">
            <div className="mc-about__preview">
              <div className="mc-viewbox">
                {profile.photo ? <img src={profile.photo} alt={profile.photoAlt} /> : <PlayerFigure />}
              </div>
              <p className="mc-about__name">{profile.name}</p>
            </div>
            <div className="mc-about__text">
              {about.story.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <dl className="mc-stats">
                {stats.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <ul className="mc-tags" aria-label="Interests">
                {about.interests.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </Window>
      </div>
    </section>
  );
}

/* ---------------- Projects: Select World screen ---------------- */
function Projects() {
  const ref = useRef(null);
  const state = useProjectFilter();
  const [selectedId, setSelectedId] = useState(null);
  const [open, setOpen] = useState(null);
  useAssemble(ref, [state.filter]);
  const selected = state.list.find((p) => p.id === selectedId) || state.list[0];
  return (
    <section id="projects" className="section mc-projects" aria-labelledby="projects-title" ref={ref}>
      <div className="container">
        <SectionHeader id="projects" eyebrow="Singleplayer" title="Select World" lead="Every world I’ve built. Select one, then play it, open the source or see details." />
        <div className="mc-select" data-block>
          <ProjectFilters state={state} className="filters mc-filters" />
          <ul className="mc-worlds" aria-label="Projects">
            {state.list.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="mc-world"
                  aria-pressed={selected?.id === p.id}
                  onClick={() => setSelectedId(p.id)}
                  onDoubleClick={() => setOpen(p)}
                >
                  <span className="mc-world__icon">
                    <ProjectThumb project={p} eager={p.featured} />
                  </span>
                  <span className="mc-world__text">
                    <span className="mc-world__name">
                      {p.title}
                      {p.featured && <span className="mc-world__star"> ★ Featured</span>} <SampleTag show={p.sample} />
                    </span>
                    <span className="mc-world__line">{p.summary}</span>
                    <span className="mc-world__line">
                      {categoryLabel(p.category)} Mode{p.year && `, ${p.year}`} · {p.tech.join(', ')}
                    </span>
                  </span>
                </button>
              </li>
            ))}
            {!state.list.length && <li className="mc-world__empty">No worlds of this type yet.</li>}
          </ul>
          {selected && (
            <div className="mc-select__actions" aria-label={`Actions for ${selected.title}`} role="group">
              {selected.liveUrl ? (
                <a className="btn" href={selected.liveUrl} target="_blank" rel="noopener noreferrer">
                  {selected.category === 'game' ? 'Play Selected World' : 'Open Live Demo'}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <button type="button" className="btn" disabled>
                  {selected.category === 'game' ? 'Play Selected World' : 'Open Live Demo'}
                </button>
              )}
              <button type="button" className="btn" onClick={() => setOpen(selected)}>
                World Details
              </button>
              {selected.sourceUrl ? (
                <a className="btn" href={selected.sourceUrl} target="_blank" rel="noopener noreferrer">
                  View Source<span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <button type="button" className="btn" disabled>
                  View Source
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <ProjectModal project={open} onClose={() => setOpen(null)} />
    </section>
  );
}

/* ---------------- Skills: statistics with XP bars ---------------- */
function Skills() {
  const ref = useRef(null);
  useAssemble(ref);
  return (
    <section id="skills" className="section mc-skills" aria-labelledby="skills-title" ref={ref}>
      <div className="container">
        <SectionHeader id="skills" eyebrow="Statistics" title="Skills" lead="Levels earned the honest way: by building things." />
        <div className="mc-skills__grid">
          {skillGroups.map((g) => (
            <Window key={g.name} title={g.name}>
              <ul className="mc-xplist">
                {g.items.map((s) => (
                  <li key={s.name} className="mc-xp">
                    <span className="mc-xp__name">{s.name}</span>
                    <span className="mc-xp__bar" aria-hidden="true">
                      <span className="mc-xp__fill" style={{ '--p': s.level / 5 }} />
                      <span className="mc-xp__lv">{s.level}</span>
                    </span>
                    <span className="sr-only">
                      Level {s.level} of 5, {skillLevels[s.level - 1]}
                    </span>
                  </li>
                ))}
              </ul>
            </Window>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Certifications: inventory ---------------- */
function Certifications() {
  const ref = useRef(null);
  const state = useCertList();
  const [open, setOpen] = useState(null);
  useAssemble(ref, [state.showAll, state.query, state.issuer]);
  if (!certifications.length) return null;
  const empty = Math.max(0, Math.ceil(Math.max(state.list.length, 27) / 9) * 9 - state.list.length);
  return (
    <section id="certifications" className="section mc-certs" aria-labelledby="certifications-title" ref={ref}>
      <div className="container">
        <SectionHeader id="certifications" eyebrow="Inventory" title="Certifications" lead="Hover or focus an item to inspect it. Select it for details and verification." />
        <CertControls state={state} />
        <Window title="Inventory" className="mc-inventory">
          <p className="mc-inventory__count">
            <Icon name="award" size={16} /> {achievements.count} / {achievements.goal} achievements
          </p>
          <ul className="mc-slots" id="cert-list">
            {state.list.map((c) => (
              <li key={c.id} className="mc-slot">
                <button type="button" className="mc-slot__btn" onClick={() => setOpen(c)} aria-describedby={`tip-${c.id}`}>
                  <CertBadge cert={c} />
                  <span className="sr-only">{c.name}</span>
                </button>
                <span className="mc-tip" role="tooltip" id={`tip-${c.id}`}>
                  <strong>{c.name}</strong>
                  <span>{c.issuer}</span>
                  {c.date && <span className="mc-tip__date">{formatDate(c.date)}</span>}
                  {c.verifyUrl && <span className="mc-tip__hint">Click to verify</span>}
                </span>
              </li>
            ))}
            {Array.from({ length: empty }, (_, i) => (
              <li key={`e${i}`} className="mc-slot mc-slot--empty" aria-hidden="true" />
            ))}
          </ul>
        </Window>
        <div className="btn-row mc-certs__foot">
          <ViewAllButton state={state} className="btn" controls="cert-list" />
          <LinkedInButton className="btn" />
        </div>
      </div>
      <CertModal cert={open} onClose={() => setOpen(null)} />
    </section>
  );
}

/* ---------------- Experience: advancements ---------------- */
const FRAME = { education: 'goal', competition: 'challenge', training: 'task', project: 'task' };

function Experience() {
  const ref = useRef(null);
  useAssemble(ref);
  if (!timeline.length) return null;
  return (
    <section id="experience" className="section mc-experience" aria-labelledby="experience-title" ref={ref}>
      <div className="container">
        <SectionHeader id="experience" eyebrow="Advancements" title="Experience" lead="Milestones unlocked along the way, newest at the top." />
        <Window title="Advancements" className="mc-adv">
          <ol className="mc-adv__tree">
            {timeline.map((t, i) => (
              <li key={i} className="mc-adv__node" data-block>
                <span className={`mc-frame mc-frame--${FRAME[t.type]}`} aria-hidden="true">
                  <Icon name={t.type} size={22} />
                </span>
                <div className="mc-adv__card">
                  <h3 className="mc-adv__title">
                    {t.title} <SampleTag show={t.sample} />
                  </h3>
                  <div className="mc-adv__body">
                    <p className="mc-adv__meta">
                      {timelineTypeLabel[t.type]} · {formatRange(t.start, t.end)}
                      {t.org && ` · ${t.org}`}
                    </p>
                    {t.description && <p>{t.description}</p>}
                    {t.skills.length > 0 && <p className="mc-adv__reward">Unlocked: {t.skills.join(', ')}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Window>
      </div>
    </section>
  );
}

/* ---------------- Contact: chat ---------------- */
function Contact() {
  const ref = useRef(null);
  useAssemble(ref);
  const { links } = profile;
  const chatLinks = [
    links.email && { href: links.email, label: 'Email', ext: false },
    links.linkedin && { href: links.linkedin, label: 'LinkedIn', ext: true },
    links.github && { href: links.github, label: 'GitHub', ext: true },
  ].filter(Boolean);
  return (
    <section id="contact" className="section mc-contact" aria-labelledby="contact-title" ref={ref}>
      <div className="container mc-contact__inner">
        <SectionHeader id="contact" eyebrow="Multiplayer" title="Join my team" lead="Have an internship slot or a project in mind? Send a message in chat." />
        <div className="mc-chat" data-block>
          <ul className="mc-chat__log" aria-label="Messages from Zachary">
            <li>
              <span className="mc-chat__name">&lt;{profile.firstName}&gt;</span> Hey! I’m {statusSentence()}.
            </li>
            <li>
              <span className="mc-chat__name">&lt;{profile.firstName}&gt;</span> Message me below, or reach me here:{' '}
              {chatLinks.map((l) => (
                <a key={l.label} className="mc-chat__link" href={l.href} {...(l.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  [{l.label}]{l.ext && <span className="sr-only"> (opens in a new tab)</span>}
                </a>
              ))}
            </li>
            <li className="mc-chat__system">{profile.firstName} joined the game</li>
          </ul>
          {formEnabled && <ContactForm submitLabel="Send" successTitle="Message sent!" />}
        </div>
      </div>
    </section>
  );
}

export const sections = {
  hero: Hero,
  about: About,
  projects: Projects,
  skills: Skills,
  certifications: Certifications,
  experience: Experience,
  contact: Contact,
};
