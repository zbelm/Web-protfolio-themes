// Normalizes the JSON in src/data so every theme reads the same clean content.
// Rule: anything wrapped in [BRACKETS] is a placeholder and never reaches the UI.
import profileRaw from '../data/profile.json';
import aboutRaw from '../data/about.json';
import projectsRaw from '../data/projects.json';
import certsRaw from '../data/certifications.json';
import skillsRaw from '../data/skills.json';
import timelineRaw from '../data/timeline.json';
import { issuerBrand } from './issuers.js';

export const isPlaceholder = (v) => typeof v === 'string' && /^\s*\[[\s\S]*\]\s*$/.test(v);
export const filled = (v) =>
  v != null && v !== '' && !isPlaceholder(v) && !(Array.isArray(v) && v.length === 0);
const val = (v, fallback = '') => (filled(v) ? v : fallback);
// Sample entries render in dev so layouts can be reviewed, never in production.
const live = (e) => !(e?._sample && import.meta.env.PROD);

const email = val(profileRaw.links?.email);
export const profile = {
  ...profileRaw,
  statuses: [profileRaw.status, ...(profileRaw.extraStatuses || [])].filter(filled),
  location: val(profileRaw.location),
  school: val(profileRaw.school),
  course: val(profileRaw.course),
  // profile.json "photo" wins; otherwise public/images/me.(webp|avif|jpg|jpeg|png) is picked up at build time.
  photo: val(profileRaw.photo) || (typeof __PHOTO__ === 'string' ? __PHOTO__ : ''),
  links: {
    github: val(profileRaw.links?.github),
    linkedin: val(profileRaw.links?.linkedin),
    email: email ? `mailto:${email}` : '',
    emailAddress: email,
  },
};

const RESUME_BYTES = typeof __RESUME_BYTES__ === 'number' ? __RESUME_BYTES__ : 0;
export const resume = RESUME_BYTES
  ? {
      href: profileRaw.resume || '/resume.pdf',
      label: `PDF · ${RESUME_BYTES > 1e6 ? (RESUME_BYTES / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(RESUME_BYTES / 1024)) + ' KB'}`,
    }
  : null;

export const projects = projectsRaw.items.filter(live).map((p) => ({
  ...p,
  title: val(p.title, p.fallbackTitle || 'Untitled project'),
  description: val(p.description, p.summary),
  liveUrl: val(p.liveUrl),
  sourceUrl: val(p.sourceUrl),
  thumbnail: val(p.thumbnail),
  screenshots: (p.screenshots || []).filter(filled),
  tech: (p.tech || []).filter(filled),
  sample: !!p._sample,
}));
// Featured project first, the rest keep file order.
projects.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
export const featuredProject = projects.find((p) => p.featured) || null;
export const projectFilters = [
  { id: 'all', label: 'All' },
  { id: 'web', label: 'Web' },
  { id: 'app', label: 'App' },
  { id: 'game', label: 'Game' },
];

export const certifications = certsRaw.items
  .filter(live)
  .filter((c) => filled(c.name))
  .map((c) => ({
    ...c,
    id: `${c.issuer}-${c.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    verifyUrl: val(c.verifyUrl),
    credentialId: val(c.credentialId),
    badgeImage: val(c.badgeImage),
    skills: (c.skills || []).filter(filled),
    brand: issuerBrand(c.issuer),
    sample: !!c._sample,
  }))
  .sort((a, b) => String(b.date).localeCompare(String(a.date)));

export const skillLevels = skillsRaw.levels;
export const skillGroups = skillsRaw.groups
  .map((g) => ({ ...g, items: g.items.filter((s) => filled(s.name)) }))
  .filter((g) => g.items.length);
export const skillCount = skillGroups.reduce((n, g) => n + g.items.length, 0);

export const timeline = timelineRaw.items
  .filter(live)
  .filter((t) => filled(t.title))
  .map((t) => ({
    ...t,
    org: val(t.org),
    start: val(t.start),
    end: val(t.end),
    description: val(t.description),
    skills: (t.skills || []).filter(filled),
    sample: !!t._sample,
  }));

const counts = { projects: projects.length, certifications: certifications.length, skills: skillCount };
export const about = {
  ...aboutRaw,
  story: aboutRaw.story.filter(filled),
  quickFacts: aboutRaw.quickFacts
    .map((f) => ({ label: f.label, value: f.source ? counts[f.source] : f.value }))
    .filter((f) => f.value > 0),
};

export const achievements = {
  count: certifications.length,
  goal: Math.max(profileRaw.achievementGoal || 10, certifications.length),
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function formatDate(d) {
  if (!filled(d)) return '';
  const [y, m] = String(d).split('-');
  return m ? `${MONTHS[+m - 1]} ${y}` : y;
}
export const formatRange = (start, end) =>
  [start, end || (start ? 'Present' : '')].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(' – ');

export function initials(s) {
  return String(s)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export const timelineTypeLabel = {
  education: 'Education',
  training: 'Training',
  competition: 'Competition',
  project: 'Personal project',
};
