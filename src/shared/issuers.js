// Issuer look for certification badges: brand color, a short text mark, and the
// company logo shape (from Simple Icons, CC0) when one is available. A cert's own
// badgeImage always wins. Unknown issuers get a stable color and their initials.
// To add an issuer: add a key (lowercase letters only) and, if Simple Icons has the
// logo, import it below and set `icon`.
import {
  siAnthropic,
  siCisco,
  siCodecademy,
  siCoursera,
  siDatacamp,
  siEdx,
  siFreecodecamp,
  siGithub,
  siGoogle,
  siHackerrank,
  siKaggle,
  siKhanacademy,
  siMeta,
  siMongodb,
  siNvidia,
  siPostman,
  siRoblox,
  siSololearn,
  siUdemy,
  siUnity,
  siW3schools,
} from 'simple-icons';

const ISSUERS = {
  anthropic: { color: '#d97757', fg: '#1f1e1d', mark: 'A', icon: siAnthropic.path },
  google: { color: '#4285f4', fg: '#ffffff', mark: 'G', icon: siGoogle.path },
  meta: { color: '#0866ff', fg: '#ffffff', mark: 'M', icon: siMeta.path },
  coursera: { color: '#0056d2', fg: '#ffffff', mark: 'C', icon: siCoursera.path },
  freecodecamp: { color: '#0a0a23', fg: '#ffffff', mark: 'fCC', icon: siFreecodecamp.path },
  microsoft: { color: '#0078d4', fg: '#ffffff', mark: 'MS' },
  aws: { color: '#232f3e', fg: '#ff9900', mark: 'AWS' },
  amazon: { color: '#232f3e', fg: '#ff9900', mark: 'AWS' },
  cisco: { color: '#049fd9', fg: '#0b1f2a', mark: 'CI', icon: siCisco.path },
  ibm: { color: '#0f62fe', fg: '#ffffff', mark: 'IBM' },
  linkedin: { color: '#0a66c2', fg: '#ffffff', mark: 'in' },
  udemy: { color: '#a435f0', fg: '#ffffff', mark: 'U', icon: siUdemy.path },
  hackerrank: { color: '#2ec866', fg: '#0b2a17', mark: 'HR', icon: siHackerrank.path },
  oracle: { color: '#c74634', fg: '#ffffff', mark: 'O' },
  unity: { color: '#222222', fg: '#ffffff', mark: 'U', icon: siUnity.path },
  roblox: { color: '#1b1d1f', fg: '#ffffff', mark: 'R', icon: siRoblox.path },
  github: { color: '#24292f', fg: '#ffffff', mark: 'GH', icon: siGithub.path },
  edx: { color: '#02262b', fg: '#ffffff', mark: 'edX', icon: siEdx.path },
  codecademy: { color: '#1f4056', fg: '#ffffff', mark: 'CC', icon: siCodecademy.path },
  kaggle: { color: '#20beff', fg: '#06283a', mark: 'K', icon: siKaggle.path },
  datacamp: { color: '#05192d', fg: '#03ef62', mark: 'DC', icon: siDatacamp.path },
  sololearn: { color: '#149ef2', fg: '#ffffff', mark: 'SL', icon: siSololearn.path },
  w3schools: { color: '#04aa6d', fg: '#ffffff', mark: 'W3', icon: siW3schools.path },
  khanacademy: { color: '#14bf96', fg: '#06302a', mark: 'KA', icon: siKhanacademy.path },
  nvidia: { color: '#76b900', fg: '#0b1a00', mark: 'NV', icon: siNvidia.path },
  postman: { color: '#ff6c37', fg: '#ffffff', mark: 'P', icon: siPostman.path },
  mongodb: { color: '#001e2b', fg: '#47a248', mark: 'MDB', icon: siMongodb.path },
  tesda: { color: '#1d4e9e', fg: '#ffffff', mark: 'T' },
};

const FALLBACK_COLORS = ['#c4281c', '#0d69ac', '#287f46', '#b45309', '#6b327c', '#0f766e'];

const initials = (s) =>
  String(s)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

export function issuerBrand(issuer = '') {
  const key = issuer.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hit = Object.keys(ISSUERS).find((k) => key.includes(k));
  if (hit) return { name: hit, ...ISSUERS[hit] };
  const h = [...key].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return { color: FALLBACK_COLORS[h % FALLBACK_COLORS.length], fg: '#ffffff', mark: initials(issuer) || '?' };
}
