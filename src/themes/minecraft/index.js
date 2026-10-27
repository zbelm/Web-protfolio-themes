// Minecraft theme: the game's UI conventions (title screen, hotbar, GUI windows,
// inventory, advancements, chat) with original procedurally generated pixel art.
import '@fontsource-variable/pixelify-sans/wght.css';
import './theme.css';
import { sections } from './sections.jsx';
import { Background, Effects, NavExtra } from './extras.jsx';

export default {
  id: 'minecraft',
  order: ['hero', 'about', 'projects', 'skills', 'certifications', 'experience', 'contact'],
  sections,
  Background,
  Effects,
  NavExtra,
  fonts: ['500 1em "Pixelify Sans Variable"'],
  signoff: 'Thanks for exploring this world. Respawn anytime.',
};
