// Project covers and certification badges with clean fallbacks when no image is set.
import Icon from './Icon.jsx';
import { initials } from './content.js';

const CAT = { web: 'Web', app: 'App', game: 'Game' };
const CAT_ICON = { web: 'code', app: 'sliders', game: 'play' };

export function ProjectThumb({ project, eager = false, className = '' }) {
  if (project.thumbnail) {
    return (
      <img
        className={`thumb ${className}`}
        src={project.thumbnail}
        alt={`${project.title} preview`}
        width="1280"
        height="720"
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    );
  }
  return (
    <div className={`thumb thumb--generated thumb--${project.category} ${className}`} aria-hidden="true">
      <span className="thumb__pattern" />
      <span className="thumb__mark">{initials(project.title)}</span>
      <span className="thumb__title">{(project.tech || []).slice(0, 3).join(' · ') || CAT[project.category]}</span>
      <span className="thumb__cat">
        <Icon name={CAT_ICON[project.category] || 'code'} size={14} />
        {CAT[project.category] || 'Project'}
      </span>
    </div>
  );
}

export function CertBadge({ cert, className = '' }) {
  if (cert.badgeImage) {
    return (
      <img className={`badge-img ${className}`} src={cert.badgeImage} alt="" width="96" height="96" loading="lazy" decoding="async" />
    );
  }
  const brand = cert.brand || { mark: initials(cert.issuer) };
  return (
    <span
      className={`badge-img badge-img--mono ${brand.icon ? 'badge-img--logo' : ''} ${className}`}
      style={brand.color ? { '--issuer': brand.color, '--issuer-fg': brand.fg } : undefined}
      data-len={brand.mark.length}
      aria-hidden="true"
    >
      {brand.icon ? (
        <svg viewBox="0 0 24 24" focusable="false">
          <path d={brand.icon} />
        </svg>
      ) : (
        brand.mark
      )}
    </span>
  );
}

export const categoryLabel = (c) => CAT[c] || 'Project';
