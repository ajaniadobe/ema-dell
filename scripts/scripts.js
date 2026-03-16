import { loadArea, setConfig } from './ak.js';

const hostnames = ['authorkit.dev'];

const locales = {
  '': { lang: 'en' },
  '/de': { lang: 'de' },
  '/es': { lang: 'es' },
  '/fr': { lang: 'fr' },
  '/hi': { lang: 'hi' },
  '/ja': { lang: 'ja' },
  '/zh': { lang: 'zh' },
};

const linkBlocks = [
  { fragment: '/fragments/' },
  { schedule: '/schedules/' },
  { youtube: 'https://www.youtube' },
];

// Blocks with self-managed styles
const components = ['fragment', 'schedule'];

// How to decorate an area before loading it
const decorateArea = ({ area = document }) => {
  const eagerLoad = (parent, selector) => {
    const img = parent.querySelector(selector);
    if (!img) return;
    img.removeAttribute('loading');
    img.fetchPriority = 'high';
  };

  eagerLoad(area, 'img');
};

export async function loadPage() {
  setConfig({ hostnames, locales, linkBlocks, components, decorateArea });
  await loadArea();

  // Add missing anchor target for hero "Explore AI Portfolio" CTA
  const factoryHeading = document.querySelector('#dell-ai-factory');
  if (factoryHeading && !document.querySelector('#ai-factory-dell')) {
    factoryHeading.id = 'ai-factory-dell';
  }

  // Remove leftover pagination text artifacts from imported content
  const paginationPatterns = /^(Previous Page\s+Next Page|Previous Slide\s+Next Slide|\d+\/\d+)$/;
  document.querySelectorAll('main .default-content p').forEach((p) => {
    if (paginationPatterns.test(p.textContent.trim())) p.remove();
  });

  // Hide sections with empty accordion blocks (no FAQ items imported)
  document.querySelectorAll('main .accordion').forEach((acc) => {
    if (!acc.querySelector('details')) {
      const section = acc.closest('.section');
      if (section) section.style.display = 'none';
    }
  });
}
await loadPage();

(function da() {
  const { searchParams } = new URL(window.location.href);
  const hasPreview = searchParams.has('dapreview');
  if (hasPreview) import('../tools/da/da.js').then((mod) => mod.default(loadPage));
  const hasQE = searchParams.has('quick-edit');
  if (hasQE) import('../tools/quick-edit/quick-edit.js').then((mod) => mod.default());
}());
