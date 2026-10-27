// Professional theme config: section order, layouts, effects. Bundled eagerly (default theme).
import './theme.css';
import { sections } from './sections.jsx';
import Effects from './Effects.jsx';

export default {
  id: 'professional',
  order: ['hero', 'about', 'projects', 'experience', 'certifications', 'skills', 'contact'],
  sections,
  Effects,
  fonts: [],
  signoff: 'Thanks for stopping by. Let’s build something good.',
};
