/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Dell site cleanup.
 * Removes non-authorable content from Dell.com pages.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  const { document } = payload;

  if (hookName === TransformHook.beforeTransform) {
    // Remove site-wide header/navigation chrome
    WebImporter.DOMUtils.remove(element, [
      'header',
      '#unified-masthead',
    ]);

    // Remove chat widgets, virtual assistant, contact panel
    WebImporter.DOMUtils.remove(element, [
      '#ucTarget',
      '.shop-ai-chat-wrapper',
      '#uc-panel',
      '#uc-floating-button',
      '#dell-global-mbox',
      '.tnt-html',
      '.cp-agreements-container',
    ]);

    // Remove OneTrust cookie consent SDK (banner, preference center, overlay)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-pc-sdk',
      '#onetrust-banner-sdk',
      '.onetrust-pc-dark-filter',
      '#ot-sdk-cookie-policy',
    ]);

    // Remove Compare Products drawer widget
    WebImporter.DOMUtils.remove(element, [
      '.cf-compare-drawer-wrap',
      '.cd-compare-drawer-wrap',
    ]);

    // Remove Brightcove / Video.js player UI chrome
    // These render as text content (play/pause/skip/captions/quality) in the imported HTML
    WebImporter.DOMUtils.remove(element, [
      '.vjs-control-bar',
      '.vjs-modal-dialog',
      '.vjs-loading-spinner',
      '.vjs-big-play-button',
      '.vjs-text-track-display',
      '.vjs-title-bar',
      '.vjs-poster',
      '.vjs-tech',
      'video-js',
    ]);

    // Remove tracking pixels and analytics beacons
    WebImporter.DOMUtils.remove(element, [
      'img[alt="dot image pixel"]',
      'img[src*="sp.analytics.yahoo.com"]',
      'img[src*="tvspix.com"]',
      'img[src*="bat.bing.com"]',
      'img[src*="t.co/1/i/adsct"]',
      'img[src*="analytics.twitter.com"]',
      'img[src*="1x1.gif"]',
    ]);

    // Remove pagination UI chrome from carousels/tabs
    const paginationEls = element.querySelectorAll('*');
    paginationEls.forEach((el) => {
      if (el.children.length === 0 && /^Showing page \d+ of \d+$/.test(el.textContent.trim())) {
        el.remove();
      }
      if (el.children.length === 0 && /^\d+\/\d+$/.test(el.textContent.trim())) {
        const prev = el.previousElementSibling;
        if (prev && /^Showing page/.test(prev.textContent.trim())) {
          el.remove();
        }
      }
    });

    // Remove blob: URLs (invalid references from original browser session)
    const blobLinks = element.querySelectorAll('a[href^="blob:"]');
    blobLinks.forEach((a) => a.remove());
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site chrome
    WebImporter.DOMUtils.remove(element, [
      // Breadcrumbs and partner banners (AI page)
      '#aibreadcrumb',
      '.ai-breadcrumb-box',
      '.ai-breadcrumbs-container',
      '.cf-partner-section',
      // Breadcrumbs (customer story pages)
      '.cp-breadcrumbs',
      '.cp-page-top-container',
      // Screen-reader only page title (customer story pages - content has own headings)
      'h1.sr-only',
      // Footer
      'footer',
      // iframes, links, noscript, scripts
      'iframe',
      'link',
      'noscript',
      'script',
      // SVG icon defs (non-authorable)
      'svg[style*="position: absolute"][aria-hidden="true"]',
      // FAQ controls (expand/collapse all buttons - not authorable)
      '.faq-controls',
      '.faq-icon',
      // Carousel navigation controls (non-authorable UI chrome)
      '.rwp-ic-controls-container',
      '.rwp-ic-itemcount-container',
      // Video play button overlays (non-authorable UI)
      'button.rwp-play-button',
      'div.rwp-play-button',
      '.sr-only[id^="description-"]',
    ]);
  }
}
