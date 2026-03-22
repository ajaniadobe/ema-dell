/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel.
 * Base block: carousel.
 * Source: https://www.dell.com/en-us/shop/scc/sc/artificial-intelligence
 * Instance: #ai-infrastructure-carousel (5 AI infrastructure product slides)
 * Generated: 2026-03-12 (Dell page is JS-rendered; selectors target fully-rendered DOM)
 *
 * Block library structure (2 columns):
 *   Each row: image (cell 1) | heading + description + CTA (cell 2)
 */
export default function parse(element, { document }) {
  const cells = [];

  // Pattern A: DDS carousel items (AI page)
  const ddsSlides = Array.from(element.querySelectorAll('.dds__carousel__item'));

  if (ddsSlides.length > 0) {
    ddsSlides.forEach((slide) => {
      const img = slide.querySelector('.ai-infrastructure-carousel-img, img');
      const imageCell = [];
      if (img) imageCell.push(img);

      const contentCell = [];
      const heading = slide.querySelector('h2, h3, [class*="h2"]');
      if (heading) contentCell.push(heading);

      const desc = slide.querySelector('.dds__body-2, p');
      if (desc) contentCell.push(desc);

      const ctaLinks = Array.from(slide.querySelectorAll('.cta-link a, .ai-infra-link'));
      ctaLinks.forEach((link) => contentCell.push(link));

      if (imageCell.length > 0 || contentCell.length > 0) {
        cells.push([imageCell, contentCell]);
      }
    });
  } else {
    // Pattern B: RWP item carousel slides (industry pages, services pages)
    const rwpSlides = Array.from(element.querySelectorAll('.rwp-ic-slide'));

    rwpSlides.forEach((slide) => {
      const imageCell = [];
      const contentCell = [];

      // Image: from .rwp-ic-slide__image or .rwp-image
      const img = slide.querySelector('.rwp-ic-slide__image img, .rwp-image img, img');
      if (img) imageCell.push(img);

      // Description container holds all text content
      const descContainer = slide.querySelector('.rwp-ic-slide__description');
      if (descContainer) {
        // Extract stat heading (h2, h3 with large colored numbers)
        const heading = descContainer.querySelector('h2, h3');
        if (heading) contentCell.push(heading);

        // Extract subtitle (h5)
        const subtitle = descContainer.querySelector('h4, h5');
        if (subtitle) contentCell.push(subtitle);

        // Extract description text (direct text nodes and p elements)
        const textNodes = [];
        descContainer.childNodes.forEach((node) => {
          if (node.nodeType === 3 && node.textContent.trim()) {
            textNodes.push(node.textContent.trim());
          }
        });
        const paras = Array.from(descContainer.querySelectorAll('p'));
        paras.forEach((p) => contentCell.push(p));
        if (textNodes.length > 0 && paras.length === 0) {
          const p = document.createElement('p');
          p.textContent = textNodes.join(' ');
          contentCell.push(p);
        }

        // CTA links
        const links = Array.from(descContainer.querySelectorAll('a[href]'));
        links.forEach((link) => contentCell.push(link));
      }

      if (imageCell.length > 0 || contentCell.length > 0) {
        cells.push([imageCell, contentCell]);
      }
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
