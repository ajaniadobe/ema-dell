/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards.
 * Base block: cards.
 * Source: https://www.dell.com/en-us/shop/scc/sc/artificial-intelligence
 * Instances:
 *   #floating-cards.theme-cards-banner-dark (customer stories with logos)
 *   #floating-cards.theme-cards-banner-light (data AI cards)
 *   .value-pillars-container (services icon cards)
 * Generated: 2026-03-12 (Dell page is JS-rendered; selectors target fully-rendered DOM)
 *
 * Block library structure (2 columns):
 *   Each row: image/icon (cell 1) | title + description + CTA (cell 2)
 * Block library structure (no images, 1 column):
 *   Each row: title + description + CTA
 */
export default function parse(element, { document }) {
  const cells = [];

  // Floating cards (customer stories / data AI) - desktop view cards
  const floatingCards = Array.from(element.querySelectorAll('.desktopView .floating-card'));

  // Value pillars (services section)
  const valuePillars = Array.from(element.querySelectorAll('.value-pillar-card, .value-pillar'));

  if (floatingCards.length > 0) {
    // Floating cards with image/logo + title + description + link
    floatingCards.forEach((card) => {
      const img = card.querySelector('.titleCards-icon img');
      const title = card.querySelector('.titleCards');
      const desc = card.querySelector('.descCards');
      const link = card.querySelector('.floatingcardLinks');

      const imageCell = [];
      if (img) {
        imageCell.push(img);
      }

      const contentCell = [];
      if (title) {
        const strong = document.createElement('strong');
        strong.textContent = title.textContent.trim();
        const p = document.createElement('p');
        p.appendChild(strong);
        contentCell.push(p);
      }
      if (desc) contentCell.push(desc);
      if (link) contentCell.push(link);

      if (imageCell.length > 0) {
        cells.push([imageCell, contentCell]);
      } else {
        cells.push(contentCell);
      }
    });
  } else if (valuePillars.length > 0) {
    // Value pillar icon cards
    valuePillars.forEach((card) => {
      const icon = card.querySelector('img');
      const title = card.querySelector('h3, h4, .value-pillar-title, [class*="title"]');
      const desc = card.querySelector('p, .value-pillar-description, [class*="description"]');

      const imageCell = [];
      if (icon) imageCell.push(icon);

      const contentCell = [];
      if (title) contentCell.push(title);
      if (desc) contentCell.push(desc);

      if (imageCell.length > 0) {
        cells.push([imageCell, contentCell]);
      } else {
        cells.push(contentCell);
      }
    });
  } else {
    // Fallback: look for generic card patterns
    const cardItems = Array.from(
      element.querySelectorAll('.cards-alignment, [class*="card"]')
    );
    cardItems.forEach((card) => {
      const img = card.querySelector('img');
      const title = card.querySelector('h2, h3, h4, strong, .titleCards, [class*="title"]');
      const desc = card.querySelector('p, .descCards, [class*="desc"]');
      const link = card.querySelector('a');

      const imageCell = [];
      if (img) imageCell.push(img);

      const contentCell = [];
      if (title) contentCell.push(title);
      if (desc && desc !== title) contentCell.push(desc);
      if (link && link !== title) contentCell.push(link);

      if (imageCell.length > 0 && contentCell.length > 0) {
        cells.push([imageCell, contentCell]);
      } else if (contentCell.length > 0) {
        cells.push(contentCell);
      }
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
