/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero.
 * Base block: hero.
 * Source: https://www.dell.com/en-us/shop/scc/sc/artificial-intelligence
 * Instances: #hero-ai (main hero with video), .live-optics-section (CTA banner with bg image)
 * Generated: 2026-03-12 (Dell page is JS-rendered; selectors target fully-rendered DOM)
 *
 * Block library structure:
 *   Row 1: Background image/video (optional)
 *   Row 2: Title + subheading + CTAs
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: Background image or video poster
  // #hero-ai has a video with poster; .live-optics-section has a background image
  const video = element.querySelector('video');
  const bgImg = element.querySelector('.live-optics-img-banner, img.live-optics-img-banner');

  if (video) {
    const posterUrl = video.getAttribute('poster');
    if (posterUrl) {
      const img = document.createElement('img');
      img.src = posterUrl.startsWith('//') ? `https:${posterUrl}` : posterUrl;
      img.alt = 'Hero background';
      cells.push([img]);
    }
  } else if (bgImg) {
    const realSrc = bgImg.getAttribute('data-src') || bgImg.getAttribute('src') || '';
    if (realSrc && !realSrc.startsWith('data:')) {
      const img = document.createElement('img');
      img.src = realSrc.startsWith('//') ? `https:${realSrc}` : realSrc;
      img.alt = bgImg.alt || 'Hero background';
      cells.push([img]);
    }
  }

  // Row 2: Heading + description + CTAs
  const contentCell = [];

  // Heading: h1 or h2
  const heading = element.querySelector('h1, h2');
  if (heading) contentCell.push(heading);

  // Description / subtitle
  const desc = element.querySelector(
    '.dds_Hero-ai-content, .live-optics-description, p:not(.faq-question)'
  );
  if (desc && desc !== heading) contentCell.push(desc);

  // CTA links
  const ctaLinks = Array.from(
    element.querySelectorAll(
      '.ai-uc-hero-btn, .live-optics-button, a.dds__button, a.live-optics-button'
    )
  );
  ctaLinks.forEach((link) => contentCell.push(link));

  if (contentCell.length > 0) {
    cells.push(contentCell);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
