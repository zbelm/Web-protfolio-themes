import { useMemo, useRef, useState } from 'react';
import Icon from '../../shared/Icon.jsx';
import Hero3D from '../../shared/Hero3D.jsx';
import ContactForm, { formEnabled } from '../../shared/ContactForm.jsx';
import { categoryLabel } from '../../shared/media.jsx';
import { CertControls, CertModal, ProjectFilters, ProjectModal, ViewAllButton } from '../../shared/details.jsx';
import { ContactLinks, ExternalLink, LinkedInButton, ResumeButton, RoleCycler, SampleTag, SectionHeader, StatusBadge } from '../../shared/ui.jsx';
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
import { badgeImage, gameThumb } from './art.js';
import { snap } from './motion.js';

const loadAvatar = () => import('./avatar3d.js');

function useSnap(ref, deps) {
  useMotion(ref, ({ gsap, root }) => snap(gsap, root), deps);
}

/* Project image: the real screenshot if set, otherwise a generated obby scene. */
function GameThumb({ project, eager = false }) {
  const src = useMemo(() => project.thumbnail || gameThumb(project), [project]);
  return (
    <img
      className="thumb rb-thumb"
      src={src}
      alt={project.thumbnail ? `${project.title} preview` : ''}
      width="640"
      height="360"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
}

function Badge({ cert }) {
  const src = useMemo(() => cert.badgeImage || badgeImage(cert), [cert]);
  return <img className="rb-badge-img" src={src} alt="" width="120" height="120" loading="lazy" decoding="async" />;
}

/* Front-view blocky avatar (CSS), used as the 3D fallback and the profile headshot. */
function CssAvatar({ head = false }) {
  return (
    <div className={`rb-avatar ${head ? 'rb-avatar--head' : ''}`} aria-hidden="true">
      <span className="rb-avatar__head">
        <i className="eye l" />
        <i className="eye r" />
        <i className="smile" />
      </span>
      {!head && (
        <>
          <span className="rb-avatar__arm l" />
          <span className="rb-avatar__torso" />
          <span className="rb-avatar__arm r" />
          <span className="rb-avatar__leg l" />
          <span className="rb-avatar__leg r" />
        </>
      )}
    </div>
  );
}

/* ---------------- Hero: spawn point ---------------- */
function Hero() {
  return (
    <section id="hero" className="rb-hero" aria-labelledby="hero-title">
      <div className="container rb-hero__grid">
        <div className="rb-spawn rb-in" aria-hidden="true">
          <Hero3D className="rb-spawn__3d" load={loadAvatar} fallback={<div className="rb-spawn__fallback"><CssAvatar /></div>} />
          <span className="rb-nametag">{profile.name}</span>
        </div>
        <div className="rb-card rb-hero__copy rb-in" style={{ '--d': '100ms' }}>
          <StatusBadge />
          <h1 id="hero-title" className="rb-hero__title">
            {profile.name}
          </h1>
          <p className="rb-hero__roles">
            <RoleCycler />
          </p>
          <p className="rb-hero__pitch">{profile.pitch}</p>
          <div className="btn-row">
            <a href="#projects" className="btn btn--primary btn--play">
              <Icon name="play" />
              <span>View Projects</span>
            </a>
            <ResumeButton className="btn btn--ghost" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- About: player card ---------------- */
function About() {
  const ref = useRef(null);
  useSnap(ref);
  return (
    <section id="about" className="section rb-about" aria-labelledby="about-title" ref={ref}>
      <div className="container">
        <SectionHeader id="about" eyebrow="Player profile" title="About me" lead={about.headline} />
        <article className="rb-card rb-player" data-brick>
          <div className="rb-player__head">
            <span className="rb-player__avatar">
              {profile.photo ? <img src={profile.photo} alt={profile.photoAlt} /> : <CssAvatar head />}
            </span>
            <div>
              <p className="rb-player__name">{profile.name}</p>
              <p className="muted">@{profile.handle}</p>
              <ul className="chips rb-player__tags">
                <li className="chip">
                  <span className="rb-dot" aria-hidden="true" /> {about.availability}
                </li>
                {profile.location && (
                  <li className="chip">
                    <Icon name="pin" size={14} /> {profile.location}
                  </li>
                )}
                {profile.course && (
                  <li className="chip">
                    <Icon name="education" size={14} /> {profile.course}
                  </li>
                )}
              </ul>
            </div>
          </div>
          <dl className="rb-player__stats">
            {about.quickFacts.map((f) => (
              <div key={f.label}>
                <dd>{f.value}</dd>
                <dt>{f.label}</dt>
              </div>
            ))}
          </dl>
          <div className="rb-player__bio">
            <h3>Bio</h3>
            {about.story.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

/* ---------------- Projects: Now playing + game cards ---------------- */
function Projects() {
  const ref = useRef(null);
  const state = useProjectFilter();
  const [open, setOpen] = useState(null);
  useSnap(ref, [state.filter]);
  const featured = state.list.find((p) => p.featured);
  const rest = state.list.filter((p) => p !== featured);
  return (
    <section id="projects" className="section rb-projects" aria-labelledby="projects-title" ref={ref}>
      <div className="container">
        <SectionHeader id="projects" eyebrow="Games & apps" title="Projects" lead="Jump into what I’ve built. The featured slot is my Roblox game." />
        <ProjectFilters state={state} className="filters rb-filters" />
        {featured && (
          <article className="rb-card rb-now" data-brick>
            <div className="rb-now__media">
              <GameThumb project={featured} eager />
              <span className="rb-now__live">
                <span className="rb-dot rb-dot--live" aria-hidden="true" /> Now playing
              </span>
            </div>
            <div className="rb-now__body">
              <p className="eyebrow">
                {categoryLabel(featured.category)}
                {featured.year && ` · ${featured.year}`}
              </p>
              <h3>{featured.title}</h3>
              <p>{featured.summary}</p>
              <ul className="chips" aria-label="Tech used">
                {featured.tech.map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>
              <div className="btn-row">
                <ExternalLink href={featured.liveUrl} className="btn btn--primary btn--play" icon="play">
                  Play
                </ExternalLink>
                <button type="button" className="btn btn--ghost" onClick={() => setOpen(featured)}>
                  Details<span className="sr-only">: {featured.title}</span>
                </button>
                <ExternalLink href={featured.sourceUrl} className="btn btn--ghost" icon="github">
                  Source
                </ExternalLink>
              </div>
            </div>
          </article>
        )}
        {rest.length > 0 && (
          <ul className="rb-games">
            {rest.map((p) => (
              <li key={p.id} className="rb-card rb-game" data-brick>
                <div className="rb-game__media">
                  <GameThumb project={p} />
                  {p.liveUrl && (
                    <a className="rb-game__play" href={p.liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${p.title} (opens in a new tab)`}>
                      <Icon name="play" size={22} />
                    </a>
                  )}
                </div>
                <div className="rb-game__body">
                  <h3>
                    {p.title} <SampleTag show={p.sample} />
                  </h3>
                  <p className="muted">{p.summary}</p>
                  <p className="rb-game__meta">
                    {categoryLabel(p.category)} · {p.tech.slice(0, 3).join(' · ')}
                  </p>
                  <div className="btn-row">
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => setOpen(p)}>
                      Details<span className="sr-only">: {p.title}</span>
                    </button>
                    <ExternalLink href={p.sourceUrl} className="btn btn--ghost btn--sm" icon="github">
                      Source
                    </ExternalLink>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!state.list.length && <p className="empty">Nothing in this category yet.</p>}
      </div>
      <ProjectModal project={open} onClose={() => setOpen(null)} />
    </section>
  );
}

/* ---------------- Skills: leaderboards ---------------- */
function Skills() {
  const ref = useRef(null);
  useSnap(ref);
  return (
    <section id="skills" className="section rb-skills" aria-labelledby="skills-title" ref={ref}>
      <div className="container">
        <SectionHeader id="skills" eyebrow="Leaderboard" title="Skills" lead="My stats, ranked from strongest to still-learning." />
        <div className="rb-boards">
          {skillGroups.map((g) => (
            <div key={g.name} className="rb-card rb-board" data-brick>
              <h3>{g.name}</h3>
              <ol>
                {[...g.items]
                  .sort((a, b) => b.level - a.level)
                  .map((s, i) => (
                    <li key={s.name} className="rb-row">
                      <span className={`rb-rank rb-rank--${i + 1}`} aria-hidden="true">
                        {i + 1}
                      </span>
                      <span className="rb-row__name">{s.name}</span>
                      <span className="rb-row__bar" aria-hidden="true">
                        <span style={{ '--p': s.level / 5 }} />
                      </span>
                      <span className="rb-row__lv">
                        Lv {s.level}
                        <span className="sr-only"> of 5, {skillLevels[s.level - 1]}</span>
                      </span>
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Certifications: badge shelf ---------------- */
function Certifications() {
  const ref = useRef(null);
  const state = useCertList();
  const [open, setOpen] = useState(null);
  useSnap(ref, [state.showAll, state.query, state.issuer]);
  if (!certifications.length) return null;
  return (
    <section id="certifications" className="section rb-certs" aria-labelledby="certifications-title" ref={ref}>
      <div className="container">
        <SectionHeader id="certifications" eyebrow="Badges" title="Certifications" lead="Earned badges, each one verifiable." />
        <p className="rb-achievements">
          <Icon name="award" />
          <span>
            <strong>
              {achievements.count} / {achievements.goal}
            </strong>{' '}
            achievements
          </span>
          <span className="rb-achievements__bar" aria-hidden="true">
            <span style={{ '--p': achievements.count / achievements.goal }} />
          </span>
        </p>
        <CertControls state={state} />
        <ul className="rb-shelf" id="cert-list">
          {state.list.map((c) => (
            <li key={c.id} className="rb-shelf__item" data-brick>
              <button type="button" className="rb-badge" onClick={() => setOpen(c)}>
                <Badge cert={c} />
                <span className="sr-only">Details for {c.name}</span>
              </button>
              <h3 className="rb-shelf__name">
                {c.name} <SampleTag show={c.sample} />
              </h3>
              <p className="muted">
                {c.issuer}
                {c.date && ` · ${formatDate(c.date)}`}
              </p>
              <ExternalLink href={c.verifyUrl} className="btn btn--ghost btn--sm" icon="verify">
                Verify<span className="sr-only"> {c.name}</span>
              </ExternalLink>
            </li>
          ))}
        </ul>
        <div className="btn-row rb-certs__foot">
          <ViewAllButton state={state} controls="cert-list" />
          <LinkedInButton />
        </div>
      </div>
      <CertModal cert={open} onClose={() => setOpen(null)} />
    </section>
  );
}

/* ---------------- Experience: quest board ---------------- */
function Experience() {
  const ref = useRef(null);
  useSnap(ref);
  if (!timeline.length) return null;
  return (
    <section id="experience" className="section rb-experience" aria-labelledby="experience-title" ref={ref}>
      <div className="container">
        <SectionHeader id="experience" eyebrow="Quest board" title="Experience" lead="Quests completed and quests in progress." />
        <ul className="rb-quests">
          {timeline.map((t, i) => {
            const active = !t.end;
            return (
              <li key={i} className="rb-card rb-quest" data-brick>
                <span className="rb-quest__stud" aria-hidden="true" />
                <p className="rb-quest__top">
                  <span className={`rb-status ${active ? 'is-active' : ''}`}>{active ? 'In progress' : 'Completed'}</span>
                  <span className="muted">{formatRange(t.start, t.end)}</span>
                </p>
                <h3>
                  {t.title} <SampleTag show={t.sample} />
                </h3>
                <p className="rb-quest__org">
                  <Icon name={t.type} size={16} /> {timelineTypeLabel[t.type]}
                  {t.org && ` · ${t.org}`}
                </p>
                {t.description && <p className="muted">{t.description}</p>}
                {t.skills.length > 0 && (
                  <p className="rb-quest__reward">
                    <strong>Rewards:</strong> {t.skills.join(', ')}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- Contact ---------------- */
function Contact() {
  const ref = useRef(null);
  useSnap(ref);
  return (
    <section id="contact" className="section rb-contact" aria-labelledby="contact-title" ref={ref}>
      <div className={`container rb-contact__grid ${formEnabled ? '' : 'is-solo'}`}>
        <div className="rb-card rb-invite" data-brick>
          <SectionHeader id="contact" eyebrow="Invite to team" title="Let’s build together" lead="Got an internship opening or a cool project? Send me a message." />
          <StatusBadge />
          <ContactLinks />
          <div className="rb-invite__art" aria-hidden="true">
            <CssAvatar />
          </div>
        </div>
        {formEnabled && (
          <div className="rb-card rb-contact__form" data-brick>
            <ContactForm submitLabel="Send message" successTitle="Message sent!" />
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
  skills: Skills,
  certifications: Certifications,
  experience: Experience,
  contact: Contact,
};
