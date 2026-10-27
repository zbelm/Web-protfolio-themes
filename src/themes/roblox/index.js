// Roblox theme: a portfolio layout with Roblox-style imagery (blocky avatar on a spawn
// pad, baseplate, obby-scene thumbnails, round badges). All art is original and drawn in code.
import '@fontsource-variable/montserrat/wght.css';
import './theme.css';
import { sections } from './sections.jsx';
import { Background, confetti } from './extras.jsx';

export default {
  id: 'roblox',
  order: ['hero', 'about', 'projects', 'skills', 'certifications', 'experience', 'contact'],
  sections,
  Background,
  onResumeDownload: confetti,
  fonts: ['700 1em "Montserrat Variable"'],
  signoff: 'GG, thanks for playing! Let’s build something together.',
};
