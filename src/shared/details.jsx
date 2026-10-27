// Detail popups shared by every theme (content is identical, styling is themed).
import Modal from './Modal.jsx';
import Icon from './Icon.jsx';
import { CertBadge, ProjectThumb, categoryLabel } from './media.jsx';
import { ExternalLink, SampleTag } from './ui.jsx';
import { formatDate } from './content.js';

export function ProjectModal({ project, onClose }) {
  const open = !!project;
  return (
    <Modal open={open} onClose={onClose} labelledBy="project-modal-title" className="modal--project">
      {project && (
        <article className="detail">
          <div className="detail__media">
            {project.screenshots.length ? (
              <ul className="detail__gallery" aria-label="Screenshots">
                {project.screenshots.map((src, i) => (
                  <li key={src}>
                    <img src={src} alt={`${project.title} screenshot ${i + 1}`} loading="lazy" decoding="async" width="1280" height="720" />
                  </li>
                ))}
              </ul>
            ) : (
              <ProjectThumb project={project} eager />
            )}
          </div>
          <div className="detail__body">
            <p className="eyebrow">
              {categoryLabel(project.category)}
              {project.year && ` · ${project.year}`}
              {project.featured && ' · Featured'}
            </p>
            <h2 id="project-modal-title" className="detail__title">
              {project.title} <SampleTag show={project.sample} />
            </h2>
            <p>{project.description}</p>
            {project.role && (
              <p className="detail__meta">
                <strong>Role:</strong> {project.role}
              </p>
            )}
            {project.tech.length > 0 && (
              <ul className="chips" aria-label="Tech used">
                {project.tech.map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>
            )}
            <div className="detail__actions">
              <ExternalLink href={project.liveUrl} className="btn btn--primary" icon="play">
                {project.category === 'game' ? 'Play' : 'Live Demo'}
              </ExternalLink>
              <ExternalLink href={project.sourceUrl} className="btn btn--ghost" icon="github">
                Source
              </ExternalLink>
            </div>
          </div>
        </article>
      )}
    </Modal>
  );
}

export function CertModal({ cert, onClose }) {
  return (
    <Modal open={!!cert} onClose={onClose} labelledBy="cert-modal-title" className="modal--cert">
      {cert && (
        <article className="detail detail--cert">
          <CertBadge cert={cert} className="detail__badge" />
          <div className="detail__body">
            <p className="eyebrow">
              {cert.issuer}
              {cert.date && ` · ${formatDate(cert.date)}`}
            </p>
            <h2 id="cert-modal-title" className="detail__title">
              {cert.name} <SampleTag show={cert.sample} />
            </h2>
            {cert.credentialId && (
              <p className="detail__meta">
                <strong>Credential ID:</strong> <code>{cert.credentialId}</code>
              </p>
            )}
            {cert.skills.length > 0 && (
              <>
                <p className="detail__meta">
                  <strong>Skills</strong>
                </p>
                <ul className="chips" aria-label="Skills covered">
                  {cert.skills.map((s) => (
                    <li key={s} className="chip">
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="detail__actions">
              <ExternalLink href={cert.verifyUrl} className="btn btn--primary" icon="verify">
                Verify credential
              </ExternalLink>
            </div>
          </div>
        </article>
      )}
    </Modal>
  );
}

export function CertControls({ state }) {
  if (!state.searchable) return null;
  return (
    <div className="cert-controls" role="search">
      <label className="field field--inline">
        <span className="sr-only">Search certifications</span>
        <Icon name="search" />
        <input type="search" placeholder="Search certifications" value={state.query} onChange={(e) => state.setQuery(e.target.value)} />
      </label>
      <label className="field field--inline">
        <span className="sr-only">Filter by issuer</span>
        <select value={state.issuer} onChange={(e) => state.setIssuer(e.target.value)}>
          <option value="all">All issuers</option>
          {state.issuers.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function ViewAllButton({ state, className = 'btn btn--ghost', controls }) {
  if (!state.hasMore) return null;
  return (
    <button type="button" className={className} onClick={state.toggleAll} aria-expanded={state.showAll} aria-controls={controls}>
      {state.showAll ? 'Show fewer' : `View all ${state.total}`}
    </button>
  );
}

export function ProjectFilters({ state, className = 'filters' }) {
  const opts = [
    { id: 'all', label: 'All' },
    { id: 'web', label: 'Web' },
    { id: 'app', label: 'App' },
    { id: 'game', label: 'Game' },
  ].filter((o) => o.id === 'all' || state.available.has(o.id));
  if (opts.length < 3) return null;
  return (
    <div className={className} role="group" aria-label="Filter projects">
      {opts.map((o) => (
        <button key={o.id} type="button" className="filter" aria-pressed={state.filter === o.id} onClick={() => state.setFilter(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
