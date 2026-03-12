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

  // Each carousel slide is a .dds__carousel__item
  const slides = Array.from(element.querySelectorAll('.dds__carousel__item'));

  slides.forEach((slide) => {
    // Image cell
    const img = slide.querySelector('.ai-infrastructure-carousel-img, img');
    const imageCell = [];
    if (img) imageCell.push(img);

    // Content cell: heading + description + CTA links
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
