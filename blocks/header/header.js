import { getConfig, getMetadata } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';
import { setColorScheme } from '../section-metadata/section-metadata.js';

const { locale, codeBase } = getConfig();

const HEADER_PATH = '/fragments/nav/header';

function closeAllMenus() {
  const openMenus = document.body.querySelectorAll('header .is-open');
  for (const openMenu of openMenus) {
    openMenu.classList.remove('is-open');
  }
}

function docClose(e) {
  if (e.target.closest('header')) return;
  closeAllMenus();
}

function toggleMenu(menu) {
  const isOpen = menu.classList.contains('is-open');
  closeAllMenus();
  if (isOpen) {
    document.removeEventListener('click', docClose);
    return;
  }

  // Setup the global close event
  document.addEventListener('click', docClose);
  menu.classList.add('is-open');
}

function decorateLanguage(btn) {
  const section = btn.closest('.section');
  btn.addEventListener('click', async () => {
    let menu = section.querySelector('.language.menu');
    if (!menu) {
      const content = document.createElement('div');
      content.classList.add('block-content');
      const fragment = await loadFragment(`${locale.prefix}${HEADER_PATH}/languages`);
      menu = document.createElement('div');
      menu.className = 'language menu';
      menu.append(fragment);
      content.append(menu);
      section.append(content);
    }
    toggleMenu(section);
  });
}

function decorateScheme(btn) {
  btn.addEventListener('click', async () => {
    const { body } = document;

    let currPref = localStorage.getItem('color-scheme');
    if (!currPref) {
      currPref = matchMedia('(prefers-color-scheme: dark)')
        .matches ? 'dark-scheme' : 'light-scheme';
    }

    const theme = currPref === 'dark-scheme'
      ? { add: 'light-scheme', remove: 'dark-scheme' }
      : { add: 'dark-scheme', remove: 'light-scheme' };

    body.classList.remove(theme.remove);
    body.classList.add(theme.add);
    localStorage.setItem('color-scheme', theme.add);
    // Re-calculatie section schemes
    const sections = document.querySelectorAll('.section');
    for (const section of sections) {
      setColorScheme(section);
    }
  });
}

function decorateNavToggle(btn) {
  btn.addEventListener('click', () => {
    const header = document.body.querySelector('header');
    if (header) header.classList.toggle('is-mobile-open');
  });
}

function decorateSearch(btn) {
  const wrapper = btn.closest('.action-wrapper');
  if (!wrapper) return;

  const form = document.createElement('form');
  form.className = 'search-form';
  form.setAttribute('role', 'search');
  form.action = 'https://www.dell.com/en-us/search';
  form.method = 'get';

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = 'Search Dell';
  input.setAttribute('aria-label', 'Search Dell');
  input.autocomplete = 'off';

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.setAttribute('aria-label', 'Search Dell');
  submitBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';

  form.append(input, submitBtn);

  // Replace the button with the search form
  wrapper.replaceChildren(form);

  // Toggle expanded state on mobile
  btn.addEventListener('click', () => {
    wrapper.classList.toggle('is-open');
    if (wrapper.classList.contains('is-open')) input.focus();
  });
}

const HEADER_ACTIONS = {
  '/tools/widgets/scheme': decorateScheme,
  '/tools/widgets/language': decorateLanguage,
  '/tools/widgets/toggle': decorateNavToggle,
  '/tools/widgets/search': decorateSearch,
};

async function decorateAction(header, pattern, decorateFn) {
  const link = header.querySelector(`[href*="${pattern}"]`);
  if (!link) return;

  const icon = link.querySelector('.icon');
  const text = link.textContent;
  const btn = document.createElement('button');
  if (icon) btn.append(icon);
  if (text) {
    const textSpan = document.createElement('span');
    textSpan.className = 'text';
    textSpan.textContent = text;
    btn.append(textSpan);
  }
  const wrapper = document.createElement('div');
  const iconClass = icon?.classList[1]?.replace('icon-', '') || pattern.split('/').pop();
  wrapper.className = `action-wrapper ${iconClass}`;
  wrapper.append(btn);
  link.parentElement.parentElement.replaceChild(wrapper, link.parentElement);

  decorateFn(btn);
}

function decorateMenu(li) {
  const nestedUl = li.querySelector(':scope > ul');
  if (!nestedUl) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'menu';
  wrapper.append(nestedUl);
  li.append(wrapper);
  return wrapper;
}

function decorateMegaMenu(li) {
  const menu = li.querySelector('.fragment-content');
  if (!menu) return null;
  const wrapper = document.createElement('div');
  wrapper.className = 'mega-menu';
  wrapper.append(menu);
  li.append(wrapper);
  return wrapper;
}

function decorateNavItem(li) {
  li.classList.add('main-nav-item');
  const link = li.querySelector(':scope > p > a');
  if (link) link.classList.add('main-nav-link');
  const menu = decorateMegaMenu(li) || decorateMenu(li);
  if (!menu) return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu(li);
  });
}

function decorateBrandSection(section) {
  section.classList.add('brand-section');
  const brandLink = section.querySelector('a');
  const p = brandLink.closest('p');

  // Hide stray text nodes inside the brand link and beside it (in the <p>)
  const containers = [brandLink, ...(p ? [p] : [])];
  for (const container of containers) {
    const textNodes = Array.from(container.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
    for (const text of textNodes) {
      const span = document.createElement('span');
      span.className = 'brand-text';
      span.append(text);
      brandLink.append(span);
    }
  }

  if (!brandLink.querySelector('svg, img, .icon')) {
    const logo = document.createElement('img');
    logo.src = `${codeBase}/img/icons/dell-logo.svg`;
    logo.alt = '';
    brandLink.prepend(logo);
  }
}

function decorateNavSection(section) {
  section.classList.add('main-nav-section');
  const navContent = section.querySelector('.default-content');
  const navList = section.querySelector('ul');
  if (!navList) return;
  navList.classList.add('main-nav-list');

  const nav = document.createElement('nav');
  nav.append(navList);
  navContent.append(nav);

  const mainNavItems = section.querySelectorAll('nav > ul > li');
  for (const navItem of mainNavItems) {
    decorateNavItem(navItem);
  }
}

async function decorateActionSection(section) {
  section.classList.add('actions-section');

  // Style user and cart links as icon buttons
  const links = section.querySelectorAll('.default-content > p > a');
  for (const link of links) {
    const icon = link.querySelector('.icon');
    const iconName = icon?.classList[1]?.replace('icon-', '');
    if (iconName === 'user' || iconName === 'cart') {
      const p = link.parentElement;
      p.classList.add('action-icon', `action-${iconName}`);
      const textNodes = Array.from(link.childNodes)
        .filter((n) => n.nodeType === Node.TEXT_NODE);
      for (const t of textNodes) {
        const span = document.createElement('span');
        span.className = 'visually-hidden';
        span.textContent = t.textContent;
        t.replaceWith(span);
      }
    }
  }

  // Add headset icon to Contact Us link (last p without .icon)
  const contactP = section.querySelector(
    '.default-content > p:last-child',
  );
  const contactLink = contactP?.querySelector('a');
  if (contactLink && !contactLink.querySelector('.icon, svg')) {
    const svg = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg',
    );
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.innerHTML = '<path d="M4 18v-6a8 8 0 1 1 16 0v6"/>'
      + '<path d="M2 17a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2z"/>'
      + '<path d="M19 17a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-2z"/>';
    contactLink.prepend(svg);
  }
}

async function decorateHeader(fragment) {
  const sections = fragment.querySelectorAll(':scope > .section');
  if (sections[0]) decorateBrandSection(sections[0]);
  if (sections[1]) decorateNavSection(sections[1]);
  if (sections[2]) decorateActionSection(sections[2]);

  for (const [pattern, decorateFn] of Object.entries(HEADER_ACTIONS)) {
    decorateAction(fragment, pattern, decorateFn);
  }
}

async function buildAgreements() {
  const path = getMetadata('header-agreements');
  if (!path) return null;
  try {
    const fragment = await loadFragment(`${locale.prefix}${path}`);
    const agreements = fragment.querySelector('.agreements');
    if (agreements) return agreements;
  } catch { /* fragment not found — skip */ }
  return null;
}

async function buildBanner() {
  const path = getMetadata('header-banner');
  if (!path) return null;
  try {
    const fragment = await loadFragment(`${locale.prefix}${path}`);
    const banner = document.createElement('div');
    banner.className = 'header-banner';
    const content = fragment.querySelector('.default-content') || fragment.querySelector('.section');
    if (content) banner.append(...content.children);
    return banner;
  } catch { /* fragment not found — skip */ }
  return null;
}

function buildBreadcrumbs() {
  let title = getMetadata('breadcrumb-title') || getMetadata('og:title') || document.title;
  title = title.replace(/\s*\|.*$/, '');
  const nav = document.createElement('nav');
  nav.className = 'breadcrumbs';
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');
  const items = [{ label: '', href: '/', isHome: true }];
  // Use explicit metadata if available, otherwise derive from locale in URL path
  let parentLabel = getMetadata('breadcrumb-parent');
  let parentUrl = getMetadata('breadcrumb-parent-url');
  if (!parentLabel) {
    const localeMatch = window.location.pathname.match(/\/(?:content\/)?([a-z]{2})-([a-z]{2})\//);
    if (localeMatch) {
      const regionNames = new Intl.DisplayNames([localeMatch[1]], { type: 'region' });
      try { parentLabel = regionNames.of(localeMatch[2].toUpperCase()); } catch { /* skip */ }
      if (parentLabel) parentUrl = `${window.location.origin}/${localeMatch[1]}-${localeMatch[2]}`;
    }
  }
  if (parentLabel) items.push({ label: parentLabel, href: parentUrl || '/' });
  // Section breadcrumb from page metadata
  const sectionLabel = getMetadata('breadcrumb-section');
  const sectionUrl = getMetadata('breadcrumb-section-url');
  if (sectionLabel) {
    items.push({ label: sectionLabel, href: sectionUrl || '/' });
  }
  items.push({ label: title });
  items.forEach((item, i) => {
    const li = document.createElement('li');
    if (i < items.length - 1) {
      const a = document.createElement('a');
      a.href = item.href;
      if (item.isHome) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 20 20');
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        svg.setAttribute('aria-label', 'Home');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M10 2.5L2 9h2.5v6.5h4V12h3v3.5h4V9H18L10 2.5z');
        path.setAttribute('fill', 'currentColor');
        svg.append(path);
        a.append(svg);
      } else {
        a.textContent = item.label;
      }
      li.append(a);
    } else {
      li.setAttribute('aria-current', 'page');
      li.textContent = item.label;
    }
    ol.append(li);
  });
  nav.append(ol);
  return nav;
}

/**
 * loads and decorates the header
 * @param {Element} el The header element
 */
export default async function init(el) {
  const headerMeta = getMetadata('header');
  const path = headerMeta || HEADER_PATH;
  try {
    const fragment = await loadFragment(`${locale.prefix}${path}`);
    fragment.classList.add('header-content');
    await decorateHeader(fragment);
    el.append(fragment);
    const banner = await buildBanner();
    if (banner) el.append(banner);
    const infoBar = document.createElement('div');
    infoBar.className = 'header-info-bar';
    const breadcrumbs = buildBreadcrumbs();
    infoBar.append(breadcrumbs);
    const agreements = await buildAgreements();
    if (agreements) infoBar.append(agreements);
    el.append(infoBar);
  } catch (e) {
    throw Error(e);
  }
}
