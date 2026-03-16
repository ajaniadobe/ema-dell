/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Dell site cleanup.
 * Removes non-authorable content from Dell.com pages.
 * Selectors verified from captured DOM of:
 *   - https://www.dell.com/en-us/shop/scc/sc/artificial-intelligence
 *   - https://www.dell.com/en-us/lp/dt/customer-stories-mclaren-racing
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove site-wide header/navigation chrome
    // AI page: <header id="unified-masthead"> contains skip link, search, sign-in, nav menus
    // Customer stories: header may also exist
    WebImporter.DOMUtils.remove(element, [
      'header',
      '#unified-masthead',
    ]);

    // Remove chat widgets, virtual assistant, contact panel
    // AI page: aside#ucTarget, .shop-ai-chat-wrapper, #uc-panel, #uc-floating-button
    // Customer stories: .cp-agreements-container
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

    // Remove tracking pixels (Yahoo analytics, etc.)
    WebImporter.DOMUtils.remove(element, [
      'img[alt="dot image pixel"]',
      'img[src*="sp.analytics.yahoo.com"]',
    ]);
  }
  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site chrome (from captured DOM)
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
