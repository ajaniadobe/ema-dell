/* eslint-disable */
/* global WebImporter */
/**
 * Parser for showcase block.
 * Extracts PLX showcase sections (full-bleed image + heading + description).
 * Used for "Extraordinary performance", "Elevated experience", etc.
 *
 * Content model:
 *   Row 1: Background image
 *   Row 2: H2 heading + description + optional CTA link
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: Background image (pre-extracted by transformer as .showcase-bg-img)
  const bgImg = element.querySelector('.showcase-bg-img, .plx-showcase__media img');
  if (bgImg) {
    const img = document.createElement('img');
    const src = bgImg.src || bgImg.getAttribute('src') || '';
    img.src = src.startsWith('//') ? `https:${src}` : src;
    img.alt = bgImg.alt || '';
    cells.push([img]);
  }

  // Row 2: Content (heading + description + CTA)
  const contentCell = [];

  const heading = element.querySelector('h2');
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.trim();
    contentCell.push(h2);
  }

  // Description - look for the showcase description paragraph
  const descEl = element.querySelector('.plx-showcase__description, .plx-showcase-container > p');
  if (descEl) {
    const p = document.createElement('p');
    p.textContent = descEl.textContent.trim();
    contentCell.push(p);
  }

  // CTA link (e.g., "View Certified Software")
  const ctaLink = element.querySelector('a[href]:not(.plx-nav-anchor)');
  if (ctaLink && ctaLink.textContent.trim().length > 0) {
    const a = document.createElement('a');
    a.href = ctaLink.href;
    a.textContent = ctaLink.textContent.trim();
    const p = document.createElement('p');
    p.appendChild(a);
    contentCell.push(p);
  }

  if (contentCell.length > 0) cells.push(contentCell);

  if (cells.length > 0) {
    const block = WebImporter.Blocks.createBlock(document, { name: 'showcase', cells });
    element.replaceWith(block);
  }
}
