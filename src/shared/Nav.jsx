import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import Modal from './Modal.jsx';
import { useApp } from '../core/AppState.jsx';
import { preloadThemes, THEMES } from '../core/registry.js';
import { play } from '../core/sound.js';
import { useActiveSection, useDismiss } from './hooks.js';
import { ResumeButton } from './ui.jsx';
import { resume } from './content.js';

const LINK_LABELS = { about: 'About', projects: 'Projects', experience: 'Experience', skills: 'Skills', contact: 'Contact' };
const LINK_ICON = { about: 'user', projects: 'play', experience: 'award', skills: 'sliders', contact: 'mail' };
const THEME_HINT = { professional: 'Clean and modern', minecraft: 'Voxel world', roblox: 'Building platform' };

function useNavLinks() {
  const { theme } = useApp();
  // Max 5 links, in the current theme's section order.
  return theme.order.filter((id) => LINK_LABELS[id]).map((id) => ({ id, label: LINK_LABELS[id] }));
}

export function ThemePicker() {
  const { themeId, requestTheme } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const btnRef = useRef(null);
  const close = useCallback((refocus) => {
    setOpen(false);
    if (refocus) btnRef.current?.focus({ preventScroll: true });
  }, []);
  useDismiss(open, ref, close);

  useEffect(() => {
    if (open) ref.current?.querySelector('[aria-checked="true"]')?.focus({ preventScroll: true });
  }, [open]);

  const onKeyDown = (e) => {
    const items = [...ref.current.querySelectorAll('[role="menuitemradio"]')];
    const i = items.indexOf(document.activeElement);
    const go = (n) => {
      e.preventDefault();
      items[(n + items.length) % items.length].focus({ preventScroll: true });
    };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(items.length - 1);
    else if (e.key === 'Tab') setOpen(false);
  };

  const label = THEMES.find((t) => t.id === themeId)?.label;
  return (
    <div className="menu" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        className="nav-pill"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Theme: ${label}`}
        onPointerEnter={preloadThemes}
        onFocus={preloadThemes}
        onClick={() => {
          preloadThemes();
          setOpen((v) => !v);
          play('click');
        }}
      >
        <Icon name="palette" />
        <span className="nav-pill__label">{label}</span>
        <Icon name="chevronDown" size={14} />
      </button>
      {open && (
        <div className="menu__panel" role="menu" aria-label="Choose theme" onKeyDown={onKeyDown}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="menuitemradio"
              aria-checked={t.id === themeId}
              tabIndex={-1}
              className="menu__item"
              onClick={() => {
                requestTheme(t.id);
                close(true);
              }}
            >
              <span className={`swatch swatch--${t.id}`} aria-hidden="true" />
              <span className="menu__text">
                {t.label}
                <small>{THEME_HINT[t.id]}</small>
              </span>
              {t.id === themeId && <Icon name="check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ModeToggle() {
  const { mode, toggleMode } = useApp();
  const next = mode === 'dark' ? 'light' : 'dark';
  return (
    <button type="button" className="icon-btn" onClick={toggleMode} aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`}>
      <Icon name={mode === 'dark' ? 'sun' : 'moon'} />
    </button>
  );
}

function Switch({ label, hint, checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="switch-row" onClick={() => onChange(!checked)}>
      <span className="switch-row__text">
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <span className="switch" aria-hidden="true">
        <span className="switch__thumb" />
      </span>
    </button>
  );
}

function SettingsList() {
  const { sound, setSound, effects, setEffects, reduced } = useApp();
  return (
    <>
      <Switch label="Sound" hint="UI sounds, off by default" checked={sound} onChange={(v) => { setSound(v); if (v) setTimeout(() => play('toggle'), 30); }} />
      <Switch
        label="Effects"
        hint={reduced ? 'Reduced motion is on in your system' : 'Animations and particles'}
        checked={effects && !reduced}
        onChange={(v) => setEffects(v)}
      />
    </>
  );
}

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const btnRef = useRef(null);
  const close = useCallback((refocus) => {
    setOpen(false);
    if (refocus) btnRef.current?.focus({ preventScroll: true });
  }, []);
  useDismiss(open, ref, close);
  return (
    <div className="menu" ref={ref}>
      <button
        ref={btnRef}
        type="button"
        className="icon-btn"
        aria-expanded={open}
        aria-controls="settings-panel"
        aria-label="Settings"
        title="Settings"
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="sliders" />
      </button>
      {open && (
        <div className="menu__panel menu__panel--settings" id="settings-panel" role="group" aria-label="Settings">
          <SettingsList />
        </div>
      )}
    </div>
  );
}

function MobileMenu({ open, onClose, links }) {
  const { themeId, requestTheme } = useApp();
  return (
    <Modal open={open} onClose={onClose} labelledBy="mobile-menu-title" className="drawer">
      <nav className="drawer__nav" aria-labelledby="mobile-menu-title">
        <h2 id="mobile-menu-title" className="sr-only">
          Menu
        </h2>
        <ul className="drawer__links">
          {links.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} onClick={onClose}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <fieldset className="drawer__group">
          <legend>Theme</legend>
          <div className="segmented">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={t.id === themeId}
                onClick={() => {
                  requestTheme(t.id);
                  onClose();
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="drawer__group">
          <SettingsList />
        </div>
        {resume && <ResumeButton className="btn btn--primary btn--block" />}
      </nav>
    </Modal>
  );
}

export default function Nav() {
  const { theme } = useApp();
  const links = useNavLinks();
  const active = useActiveSection(links.map((l) => l.id));
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const NavExtra = theme.NavExtra;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header className="nav" data-scrolled={scrolled || undefined}>
      <div className="nav__inner container">
        <a href="#top" className="nav__logo" aria-label="zachary.dev, back to top">
          zachary<span>.dev</span>
        </a>
        <nav className="nav__links" aria-label="Primary">
          <ul>
            {links.map((l, i) => (
              <li key={l.id}>
                <a href={`#${l.id}`} aria-current={active === l.id ? 'true' : undefined} onClick={() => play('click')}>
                  <span className="nav__slot" aria-hidden="true">
                    {i + 1}
                  </span>
                  <Icon name={LINK_ICON[l.id]} className="nav__icon" />
                  <span className="nav__label">{l.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav__tools">
          {NavExtra && <NavExtra />}
          <div className="nav__desktop-only">
            <ThemePicker />
          </div>
          <ModeToggle />
          <div className="nav__desktop-only">
            <SettingsMenu />
          </div>
          <ResumeButton className="btn btn--primary btn--sm nav__resume nav__desktop-only" label="Resume" showSize={false} />
          <button
            type="button"
            className="icon-btn nav__burger"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={links} />
    </header>
  );
}
