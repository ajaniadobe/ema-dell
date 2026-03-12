import { loadBlock, loadStyle } from './ak.js';

export default async function loadPostLCP() {
  const header = document.querySelector('header');
  if (header) await loadBlock(header);
  loadStyle('/styles/fonts.css');
}
