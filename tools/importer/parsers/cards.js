/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards.
 * Base block: cards.
 * Sources:
 *   - https://www.dell.com/en-us/shop/scc/sc/artificial-intelligence
 *     Instances: #floating-cards (customer stories/data AI), .value-pillars-container (services)
 *   - https://www.dell.com/en-us/lp/dt/customer-stories-mclaren-racing
 *     Instances: .rwp-contentlayout (business results with icons), .rwp-itemcarousel (product cards)
 *
 * Block library structure:
 *   Row per card: [image] | title + desc + CTA
 */
export default function parse(element, { document }) {
  const cells = [];

  // --- Pattern A: AI page - Floating cards (customer stories / data AI) ---
  const floatingCards = Array.from(element.querySelectorAll('.desktopView .floating-card'));

  // --- Pattern B: AI page - Value pillars (services section) ---
  const valuePillars = Array.from(element.querySelectorAll('.value-pillar-card, .value-pillar'));

  // --- Pattern C: Customer story - ContentLayout items with icons (business results) ---
  const contentLayoutItems = Array.from(
    element.querySelectorAll('.rwp-contentlayout-item--columns-Four')
  );

  // --- Pattern D: Customer story - ItemCarousel slides (product cards) ---
  const carouselSlides = Array.from(element.querySelectorAll('.rwp-ic-slide'));

  if (floatingCards.length > 0) {
    // Floating cards with image/logo + title + description + link
    floatingCards.forEach((card) => {
      const img = card.querySelector('.titleCards-icon img');
      const title = card.querySelector('.titleCards');
      const desc = card.querySelector('.descCards');
      const link = card.querySelector('.floatingcardLinks');

      const imageCell = [];
      if (img) imageCell.push(img);

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
  } else if (contentLayoutItems.length > 0) {
    // Customer story business results - 4-column icon+stat cards
    contentLayoutItems.forEach((card) => {
      // SVG icons are in visual container
      const svgIcon = card.querySelector('.rwp-contentlayout-item__visual-container svg');
      const desc = card.querySelector('.rwp-contentlayout-item__description');

      const imageCell = [];
      if (svgIcon) {
        // Convert SVG icon name to a placeholder image reference
        const iconName = svgIcon.getAttribute('data-icon-name') || 'icon';
        const img = document.createElement('img');
        img.src = `./icons/${iconName}.svg`;
        img.alt = iconName;
        imageCell.push(img);
      }

      const contentCell = [];
      if (desc) {
        const p = document.createElement('p');
        p.innerHTML = desc.innerHTML.trim();
        contentCell.push(p);
      }

      if (imageCell.length > 0 && contentCell.length > 0) {
        cells.push([imageCell, contentCell]);
      } else if (contentCell.length > 0) {
        cells.push(contentCell);
      }
    });
  } else if (carouselSlides.length > 0) {
    // Customer story product cards (text-only, no images)
    carouselSlides.forEach((slide) => {
      const title = slide.querySelector('.rwp-ic-slide__title, h3, h2');
      const desc = slide.querySelector('.rwp-ic-slide__description');
      const ctaLink = slide.querySelector('.rwp-button__link, .rwp-webpart__links a');

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
      if (ctaLink) contentCell.push(ctaLink);

      if (contentCell.length > 0) {
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
