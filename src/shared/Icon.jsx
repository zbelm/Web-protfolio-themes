import { Fragment } from 'react';

// Small inline icon set (stroke icons, 24px grid). Decorative by default:
// always pair with visible text or an aria-label on the parent control.
const P = (d) => <path d={d} />;
const ICONS = {
  github: [P('M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4'), P('M9 18c-4.51 2-5-2-7-2')],
  linkedin: [P('M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z'), <rect key="r" x="2" y="9" width="4" height="12" />, <circle key="c" cx="4" cy="4" r="2" />],
  mail: [<rect key="r" x="2" y="4" width="20" height="16" rx="2" />, P('m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7')],
  download: [P('M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'), P('m7 10 5 5 5-5'), P('M12 15V3')],
  arrowRight: [P('M5 12h14'), P('m12 5 7 7-7 7')],
  arrowUp: [P('m5 12 7-7 7 7'), P('M12 19V5')],
  external: [P('M15 3h6v6'), P('M10 14 21 3'), P('M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6')],
  code: [P('m16 18 6-6-6-6'), P('m8 6-6 6 6 6')],
  sun: [<circle key="c" cx="12" cy="12" r="4" />, P('M12 2v2M12 20v2m-7.07-17.07 1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41')],
  moon: [P('M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z')],
  sliders: [P('M20 7h-9M14 17H5'), <circle key="a" cx="17" cy="17" r="3" />, <circle key="b" cx="7" cy="7" r="3" />],
  close: [P('M18 6 6 18M6 6l12 12')],
  menu: [P('M4 6h16M4 12h16M4 18h16')],
  check: [P('M20 6 9 17l-5-5')],
  chevronDown: [P('m6 9 6 6 6-6')],
  play: [<polygon key="p" points="7 4 20 12 7 20 7 4" />],
  palette: [P('M12 22a10 10 0 1 1 10-10c0 2.5-2 3-3.5 3H16a2 2 0 0 0-1.5 3.3A2 2 0 0 1 12 22z'), <circle key="a" cx="7.5" cy="10.5" r="1" />, <circle key="b" cx="12" cy="7.5" r="1" />, <circle key="c" cx="16.5" cy="10.5" r="1" />],
  search: [<circle key="c" cx="11" cy="11" r="7" />, P('m21 21-4.3-4.3')],
  pin: [P('M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z'), <circle key="c" cx="12" cy="10" r="3" />],
  education: [P('M22 10 12 5 2 10l10 5 10-5z'), P('M6 12v5c3 3 9 3 12 0v-5')],
  training: [P('M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z'), P('M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5')],
  competition: [P('M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z'), P('M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3')],
  project: [P('m16 18 6-6-6-6'), P('m8 6-6 6 6 6')],
  award: [<circle key="c" cx="12" cy="8" r="6" />, P('M15.48 12.89 17 22l-5-3-5 3 1.52-9.11')],
  verify: [P('M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'), P('m9 12 2 2 4-4')],
  sparkle: [P('M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z')],
  volume: [P('M11 5 6 9H2v6h4l5 4V5z'), P('M15.5 8.5a5 5 0 0 1 0 7')],
  calendar: [<rect key="r" x="3" y="4" width="18" height="18" rx="2" />, P('M16 2v4M8 2v4M3 10h18')],
  user: [<circle key="c" cx="12" cy="8" r="4" />, P('M4 21a8 8 0 0 1 16 0')],
};

export default function Icon({ name, size = 18, className = '', strokeWidth = 2 }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {(ICONS[name] || []).map((el, i) => (
        <Fragment key={i}>{el}</Fragment>
      ))}
    </svg>
  );
}
