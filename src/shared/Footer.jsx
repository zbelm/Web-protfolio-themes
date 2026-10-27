import Icon from './Icon.jsx';
import { profile } from './content.js';
import { useApp } from '../core/AppState.jsx';

export default function Footer() {
  const { theme } = useApp();
  const { links } = profile;
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <p className="footer__signoff">{theme.signoff || 'Thanks for stopping by. Let’s build something good.'}</p>
          <p className="footer__copy">
            © {new Date().getFullYear()} {profile.name} · {profile.brand}
          </p>
        </div>
        <div className="footer__actions">
          {links.github && (
            <a className="icon-btn" href={links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub (opens in a new tab)">
              <Icon name="github" />
            </a>
          )}
          {links.linkedin && (
            <a className="icon-btn" href={links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (opens in a new tab)">
              <Icon name="linkedin" />
            </a>
          )}
          <a className="btn btn--ghost btn--sm" href="#top">
            <Icon name="arrowUp" />
            <span>Back to top</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
