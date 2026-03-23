import { getConfig, getMetadata } from '../../scripts/ak.js';
import { loadFragment } from '../fragment/fragment.js';

const FOOTER_PATH = '/fragments/nav/footer';

/**
 * loads and decorates the footer
 * @param {Element} el The footer element
 */
export default async function init(el) {
  const { locale } = getConfig();
  const footerMeta = getMetadata('footer');
  const path = footerMeta || FOOTER_PATH;
  try {
    const fragment = await loadFragment(`${locale.prefix}${path}`);
    fragment.classList.add('footer-content');

    const sections = [...fragment.querySelectorAll('.section')];

    if (sections.length >= 2) {
      sections.pop().classList.add('section-copyright');
      sections.pop().classList.add('section-legal');
    }

    // Back-to-top button
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 4l-8 8h5v8h6v-8h5z" fill="currentColor"/></svg>';
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    el.append(backToTop);
    el.append(fragment);
  } catch (e) {
    throw Error(e);
  }
}
