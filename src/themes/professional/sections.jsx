import { useEffect, useRef, useState } from 'react';
import Icon from '../../shared/Icon.jsx';
import ContactForm, { formEnabled } from '../../shared/ContactForm.jsx';
import { CertBadge, ProjectThumb, categoryLabel } from '../../shared/media.jsx';
import { CertControls, CertModal, ProjectFilters, ProjectModal, ViewAllButton } from '../../shared/details.jsx';
import { ContactLinks, LinkedInButton, ResumeButton, RoleCycler, SampleTag, SectionHeader, StatusBadge, ExternalLink } from '../../shared/ui.jsx';
import { useCertList, useProjectFilter } from '../../shared/hooks.js';
import { useMotion } from '../../core/useMotion.js';
import { useApp } from '../../core/AppState.jsx';
import {
  about,
  certifications,
  formatDate,
  formatRange,
  initials,
  profile,
  skillGroups,
  skillLevels,
  timeline,
  timelineTypeLabel,
} from '../../shared/content.js';
import { reveal, countUp } from './motion.js';

function useReveal(ref) {
  useMotion(ref, ({ gsap, root }) => reveal(gsap, root));
}

/* ---------------- Hero ---------------- */
function Hero() {
  const ref = useRef(null);
  const { motionOK } = useApp();
  useEffect(() => (motionOK && ref.current ? countUp(ref.current) : undefined), [motionOK]);
  // Dev shows an empty frame as a reminder; the live site falls back to the card alone.
  const hasPortrait = Boolean(profile.photo) || import.meta.env.DEV;
  return (
    <section id="hero" className="pf-hero" aria-labelledby="hero-title" ref={ref}>
      <div className="pf-mesh fx" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="container pf-hero__grid">
        <div className="pf-hero__copy">
          <StatusBadge className="pf-in" />
          <h1 id="hero-title" className="pf-hero__title pf-in" style={{ '--d': '80ms' }}>
            {profile.name}
          </h1>
          <p className="pf-hero__roles pf-in" style={{ '--d': '160ms' }}>
            <RoleCycler />
          </p>
          <p className="pf-hero__pitch pf-in" style={{ '--d': '240ms' }}>
            {profile.pitch}
          </p>
          <div className="btn-row pf-in" style={{ '--d': '320ms' }}>
            <a href="#projects" className="btn btn--primary" data-magnetic>
              <span>View Projects</span>
              <Icon name="arrowRight" />
            </a>
            <ResumeButton className="btn btn--ghost" />
          </div>
        </div>
        <div className={`pf-hero__visual pf-in ${hasPortrait ? 'has-portrait' : ''}`} style={{ '--d': '200ms' }}>
          {profile.photo ? (
            <figure className="pf-portrait">
              <img src={profile.photo} alt={profile.photoAlt} width="800" height="1000" fetchPriority="high" decoding="async" />
            </figure>
          ) : (
            hasPortrait && (
              <figure className="pf-portrait pf-portrait--empty">
                <figcaption>
                  <Icon name="user" size={28} />
                  <strong>Your photo goes here</strong>
                  <span>
                    Save it as <code>public/images/me.jpg</code> (or .webp / .png). This hint only shows in dev.
                  </span>
                </figcaption>
              </figure>
            )
          )}
        <aside className="pf-card pf-glow pf-hero__card" aria-label="Profile snapshot">
          <div className="pf-hero__id">
            {!hasPortrait && (
              <span className="pf-avatar monogram" aria-hidden="true">
                {initials(profile.name)}
              </span>
            )}
            <div>
              <p className="pf-hero__name">{profile.name}</p>
              <p className="muted">@{profile.handle}</p>
            </div>
          </div>
          <dl className="pf-facts">
            {about.quickFacts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>
                  <span className="sr-only">{f.value}</span>
                  <span aria-hidden="true" data-count={f.value}>
                    {f.value}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <ul className="pf-hero__meta">
            {profile.course && (
              <li>
                <Icon name="education" /> {profile.course}
                {profile.school && `, ${profile.school}`}
              </li>
            )}
            {profile.location && (
              <li>
                <Icon name="pin" /> {profile.location}
              </li>
            )}
            <li>
              <Icon name="calendar" /> {about.availability}
            </li>
          </ul>
        </aside>
        </div>
      </div>
    </section>
  );
}

/* ---------------- About ---------------- */
function About() {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section id="about" className="section pf-about" aria-labelledby="about-title" ref={ref}>
      <div className="container pf-about__grid">
        <SectionHeader id="about" title={about.headline} split />
        <div className="pf-about__body">
          {about.story.map((p, i) => (
            <p key={i} data-reveal>
              {p}
            </p>
          ))}
          <ul className="pf-about__facts" data-reveal>
            {profile.location && (
              <li>
                <span className="muted">Based in</span>
                <strong>{profile.location}</strong>
              </li>
            )}
            <li>
              <span className="muted">Availability</span>
              <strong>{about.availability}</strong>
            </li>
            {profile.school && (
              <li>
                <span className="muted">School</span>
                <strong>{profile.school}</strong>
              </li>
            )}
          </ul>
          <ul className="chips" aria-label="Interests" data-reveal>
            {about.interests.map((t) => (
              <li key={t} className="chip">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Projects ---------------- */
function ProjectActions({ p, onOpen }) {
  return (
    <div className="pf-project__actions">
      <button type="button" className="pf-stretch btn btn--ghost btn--sm" onClick={() => onOpen(p)}>
        Details<span className="sr-only">: {p.title}</span>
      </button>
      <ExternalLink href={p.liveUrl} className="btn btn--primary btn--sm" icon="play">
        {p.category === 'game' ? 'Play' : 'Live Demo'}
      </ExternalLink>
      <ExternalLink href={p.sourceUrl} className="btn btn--ghost btn--sm" icon="github">
        Source
      </ExternalLink>
    </div>
  );
}

function ProjectCard({ p, onOpen, featured = false }) {
  return (
    <article className={`pf-card pf-glow pf-project ${featured ? 'pf-project--featured' : ''}`} data-reveal>
      <div className="pf-project__media">
        <ProjectThumb project={p} eager={featured} />
      </div>
      <div className="pf-project__body">
        <h3 className="pf-project__title">
          {p.title} <SampleTag show={p.sample} />
        </h3>
        <p className="pf-project__meta">
          {featured && <span className="pf-project__flag">Featured</span>}
          {categoryLabel(p.category)}
          {p.year && ` · ${p.year}`}
        </p>
        <p className="muted">{p.summary}</p>
        {featured && p.role && (
          <p className="pf-project__role">
            <strong>Role</strong> {p.role}
          </p>
        )}
        <ul className="chips" aria-label="Tech used">
          {p.tech.map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
        <ProjectActions p={p} onOpen={onOpen} />
      </div>
    </article>
  );
}

function Projects() {
  const ref = useRef(null);
  const state = useProjectFilter();
  const [open, setOpen] = useState(null);
  useMotion(ref, ({ gsap, root }) => reveal(gsap, root), [state.filter]);
  const featured = state.list.find((p) => p.featured);
  const rest = state.list.filter((p) => p !== featured);
  return (
    <section id="projects" className="section pf-projects" aria-labelledby="projects-title" ref={ref}>
      <div className="container">
        <div className="pf-projects__head">
          <SectionHeader id="projects" title="Things I’ve built" lead="Games, web apps and mobile apps, each with the role I played." split />
          <ProjectFilters state={state} />
        </div>
        {featured && <ProjectCard p={featured} onOpen={setOpen} featured />}
        {rest.length > 0 && (
          <div className="pf-projects__grid">
            {rest.map((p) => (
              <ProjectCard key={p.id} p={p} onOpen={setOpen} />
            ))}
          </div>
        )}
        {!state.list.length && <p className="empty">No projects in this category yet.</p>}
      </div>
      <ProjectModal project={open} onClose={() => setOpen(null)} />
    </section>
  );
}

/* ---------------- Experience ---------------- */
function Experience() {
  const ref = useRef(null);
  useReveal(ref);
  if (!timeline.length) return null;
  return (
    <section id="experience" className="section pf-experience" aria-labelledby="experience-title" ref={ref}>
      <div className="container pf-experience__grid">
        <SectionHeader id="experience" title="The path so far" lead="School, training, competitions and the projects that taught me the most." split />
        <ol className="pf-timeline">
          {timeline.map((t, i) => (
            <li key={i} className="pf-timeline__item" data-reveal>
              <span className="pf-timeline__dot" aria-hidden="true">
                <Icon name={t.type} size={16} />
              </span>
              <p className="pf-timeline__date">
                {formatRange(t.start, t.end)}
                <span className="pf-timeline__type">{timelineTypeLabel[t.type]}</span>
              </p>
              <h3>
                {t.title} <SampleTag show={t.sample} />
              </h3>
              {t.org && <p className="pf-timeline__org">{t.org}</p>}
              {t.description && <p className="muted">{t.description}</p>}
              {t.skills.length > 0 && (
                <ul className="chips" aria-label="Skills">
                  {t.skills.map((s) => (
                    <li key={s} className="chip">
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------- Certifications ---------------- */
function Certifications() {
  const ref = useRef(null);
  const state = useCertList();
  const [open, setOpen] = useState(null);
  useMotion(ref, ({ gsap, root }) => reveal(gsap, root), [state.showAll, state.query, state.issuer]);
  if (!certifications.length) return null;
  return (
    <section id="certifications" className="section pf-certs" aria-labelledby="certifications-title" ref={ref}>
      <div className="container">
        <SectionHeader id="certifications" title="Verified learning" lead="Courses I finished, each with a link to verify it." split />
        <CertControls state={state} />
        <ul className="pf-certs__grid" id="cert-list">
          {state.list.map((c) => (
            <li key={c.id} className="pf-card pf-glow pf-cert" data-reveal>
              <CertBadge cert={c} />
              <div className="pf-cert__body">
                <h3 className="pf-cert__name">
                  <button type="button" className="pf-stretch" onClick={() => setOpen(c)}>
                    {c.name}
                  </button>{' '}
                  <SampleTag show={c.sample} />
                </h3>
                <p className="muted">
                  {c.issuer}
                  {c.date && <> · {formatDate(c.date)}</>}
                </p>
              </div>
              <ExternalLink href={c.verifyUrl} className="btn btn--ghost btn--sm pf-cert__verify" icon="verify">
                Verify<span className="sr-only"> {c.name}</span>
              </ExternalLink>
            </li>
          ))}
        </ul>
        {!state.list.length && <p className="empty">No certifications match that search.</p>}
        <div className="pf-certs__foot">
          <ViewAllButton state={state} controls="cert-list" />
          <LinkedInButton />
        </div>
      </div>
      <CertModal cert={open} onClose={() => setOpen(null)} />
    </section>
  );
}

/* ---------------- Skills ---------------- */
function Skills() {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section id="skills" className="section pf-skills" aria-labelledby="skills-title" ref={ref}>
      <div className="container">
        <SectionHeader id="skills" title="What I work with" lead="Honest levels, from just starting to use daily." split />
        <div className="pf-skills__grid">
          {skillGroups.map((g) => (
            <div key={g.name} className="pf-card pf-skills__group" data-reveal>
              <h3>{g.name}</h3>
              <ul className="pf-skill-list">
                {g.items.map((s) => (
                  <li key={s.name} className="pf-skill">
                    <span className="pf-skill__name">{s.name}</span>
                    <span className="pf-skill__level" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <i key={n} className={n <= s.level ? 'on' : ''} />
                      ))}
                    </span>
                    <span className="pf-skill__label">{skillLevels[s.level - 1]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Contact ---------------- */
function Contact() {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section id="contact" className="section pf-contact" aria-labelledby="contact-title" ref={ref}>
      <div className={`container pf-contact__grid ${formEnabled ? '' : 'pf-contact__grid--solo'}`}>
        <div>
          <SectionHeader id="contact" title="Let’s work together" lead="Looking for an intern who ships? Send a message and I’ll get back to you quickly." split />
          <StatusBadge />
          <ContactLinks className="pf-contact__links" />
        </div>
        {formEnabled && (
          <div className="pf-card pf-contact__card" data-reveal>
            <ContactForm />
          </div>
        )}
      </div>
    </section>
  );
}

export const sections = {
  hero: Hero,
  about: About,
  projects: Projects,
  experience: Experience,
  certifications: Certifications,
  skills: Skills,
  contact: Contact,
};
