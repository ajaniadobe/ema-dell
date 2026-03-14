/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Dell AI page cleanup.
 * Removes non-authorable content from Dell.com pages.
 * All selectors verified from captured DOM of https://www.dell.com/en-us/shop/scc/sc/artificial-intelligence
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove chat widgets, virtual assistant, contact panel (from captured DOM: aside#ucTarget, .shop-ai-chat-wrapper, #uc-panel, #uc-floating-button)
    WebImporter.DOMUtils.remove(element, [
      '#ucTarget',
      '.shop-ai-chat-wrapper',
      '#uc-panel',
      '#uc-floating-button',
      '#dell-global-mbox',
      '.tnt-html',
    ]);
  }
  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site chrome (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      // Breadcrumbs and partner banners
      '#aibreadcrumb',
      '.ai-breadcrumb-box',
      '.ai-breadcrumbs-container',
      '.cf-partner-section',
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
      // FAQ SVG icons
      '.faq-icon',
    ]);
  }
}
