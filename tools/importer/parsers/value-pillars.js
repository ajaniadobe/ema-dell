/* eslint-disable */
/* global WebImporter */
/**
 * Parser for value-pillars (outputs a cards block).
 * Base block: cards.
 * Sources:
 *   - https://www.dell.com/en-us/shop/scc/sc/networking-products
 *     Instances: .value-pillars-container (benefit pillar cards)
 *
 * Handles Dell DDS card components (.dds__card.vp_card_bg) found inside
 * value-pillars-container sections. Extracts title, description, and CTA link
 * from each pillar card and outputs them as a standard cards block.
 *
 * Block library structure:
 *   Row per card: title (strong) + desc + CTA
 */
export default function parse(element, { document }) {
  const cells = [];

  // DDS value pillar cards
  const ddsCards = Array.from(element.querySelectorAll('.dds__card.vp_card_bg'));

  if (ddsCards.length > 0) {
    ddsCards.forEach((card) => {
      const title = card.querySelector('.dds__card__header h3, .dds__card__header h4');
      const desc = card.querySelector('.dds__card__body');
      const link = card.querySelector('.dds__card__footer a');

      const contentCell = [];
      if (title) {
        const strong = document.createElement('strong');
        strong.textContent = title.textContent.trim();
        const p = document.createElement('p');
        p.appendChild(strong);
        contentCell.push(p);
      }
      if (desc) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        contentCell.push(p);
      }
      if (link) contentCell.push(link);

      if (contentCell.length > 0) {
        cells.push(contentCell);
      }
    });
  }

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
