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

function decorateSubnavs() {
  // Detect subnav pattern: default-content with exactly p + ul + p children
  document.querySelectorAll('.section.dark > .default-content').forEach((dc) => {
    const children = [...dc.children];
    if (children.length !== 3) return;
    const [first, middle, last] = children;
    if (first.tagName !== 'P' || middle.tagName !== 'UL' || last.tagName !== 'P') return;
    if (!middle.querySelector('li a')) return;

    dc.classList.add('subnav');

    // Collect scroll targets: subsequent main sections only (skip siblings in hero section)
    const section = dc.closest('.section');
    const targets = [];
    let nextSection = section.nextElementSibling;
    while (nextSection && nextSection.classList.contains('section')) {
      if (nextSection.offsetHeight > 0) targets.push(nextSection);
      nextSection = nextSection.nextElementSibling;
    }

    // Use fixed positioning to keep subnav visible across all sections
    let isFixed = false;
    const spacer = document.createElement('div');
    spacer.style.display = 'none';
    dc.after(spacer);

    const onScroll = () => {
      const rect = spacer.style.display === 'none'
        ? dc.getBoundingClientRect() : spacer.getBoundingClientRect();
      if (rect.top <= 0 && !isFixed) {
        isFixed = true;
        spacer.style.display = 'block';
        spacer.style.height = `${dc.offsetHeight}px`;
        dc.classList.add('subnav-fixed');
      } else if (spacer.getBoundingClientRect().top > 0 && isFixed) {
        isFixed = false;
        spacer.style.display = 'none';
        dc.classList.remove('subnav-fixed');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Map nav links to targets and assign anchor IDs
    const navLinks = [...middle.querySelectorAll('li a')];
    navLinks.forEach((link, i) => {
      const id = link.textContent.trim().toLowerCase().replace(/\s+/g, '-');
      if (i < targets.length) {
        // Don't overwrite IDs set by block decorators (e.g. portfolio cards sets #solutions)
        if (!targets[i].id) targets[i].id = id;
        link.href = `#${targets[i].id}`;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          targets[i].scrollIntoView({ behavior: 'smooth' });
        });
      } else {
        // More links than sections — look for a sub-element to scroll to
        // e.g. "Reviews" link → #awards-and-reviews heading in last section
        const lastTarget = targets[targets.length - 1];
        if (lastTarget) {
          const escapedId = CSS.escape(id);
          const sub = lastTarget.querySelector(`#${escapedId}`)
            || lastTarget.querySelector(`[id*="${escapedId}"]`)
            || lastTarget.querySelector('h2[id]:last-of-type');
          const scrollTarget = sub || lastTarget;
          link.href = `#${scrollTarget.id || id}`;
          link.addEventListener('click', (e) => {
            e.preventDefault();
            scrollTarget.scrollIntoView({ behavior: 'smooth' });
          });
        }
      }
    });

    // Set first link active by default
    if (navLinks.length) navLinks[0].classList.add('active');

    // Scroll-based highlighting with IntersectionObserver
    if (!navLinks.length || !targets.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const idx = targets.indexOf(entry.target);
        if (idx === -1 || idx >= navLinks.length) return;
        if (entry.isIntersecting) {
          navLinks.forEach((l) => l.classList.remove('active'));
          navLinks[idx].classList.add('active');
        }
      });
      // If nothing is intersecting and we scrolled above the first target, reset to first
      const firstRect = targets[0].getBoundingClientRect();
      if (firstRect.top > window.innerHeight * 0.2) {
        navLinks.forEach((l) => l.classList.remove('active'));
        navLinks[0].classList.add('active');
      }
    }, { rootMargin: '-20% 0px -60% 0px' });

    targets.slice(0, navLinks.length).forEach((t) => observer.observe(t));
  });
}

export async function loadPage() {
  // Skip-to-main accessibility link
  const skip = document.createElement('a');
  skip.href = '#main';
  skip.className = 'skip-to-main';
  skip.textContent = 'Skip to main content';
  document.body.prepend(skip);
  const main = document.querySelector('main');
  if (main) main.id = 'main';

  setConfig({ hostnames, locales, linkBlocks, components, decorateArea });
  await loadArea();

  // Remove leftover pagination text artifacts from imported content
  // TODO: Strip these during import so this runtime cleanup is not needed
  document.querySelectorAll('main .default-content p').forEach((p) => {
    const text = p.textContent.trim();
    if (/^Previous\s+(Page|Slide)\s+Next\s+(Page|Slide)$/.test(text)) p.remove();
  });

  // Hide sections with empty accordion blocks (no FAQ items imported)
  document.querySelectorAll('main .accordion').forEach((acc) => {
    if (!acc.querySelector('details')) {
      const section = acc.closest('.section');
      if (section) section.style.display = 'none';
    }
  });

  // Hide broken images gracefully (e.g. external CDN images that 404)
  document.querySelectorAll('main img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) img.style.display = 'none';
    img.addEventListener('error', () => { img.style.display = 'none'; });
  });

  // Decorate sticky sub-navigation bars and add scroll-based highlighting
  decorateSubnavs();

  // Scroll-triggered fade-in for sections
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('main > .section').forEach((s) => sectionObserver.observe(s));
}
await loadPage();

(function da() {
  const { searchParams } = new URL(window.location.href);
  const hasPreview = searchParams.has('dapreview');
  if (hasPreview) import('../tools/da/da.js').then((mod) => mod.default(loadPage));
  const hasQE = searchParams.has('quick-edit');
  if (hasQE) import('../tools/quick-edit/quick-edit.js').then((mod) => mod.default());
}());
