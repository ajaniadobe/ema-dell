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

  // --- Pattern E: Services/Solutions - ContentLayout items with 2 or 3 columns ---
  const multiColItems = Array.from(
    element.querySelectorAll('.rwp-contentlayout-item--columns-Two, .rwp-contentlayout-item--columns-Three')
  );

  // --- Pattern F: TileLayout grid items (stats, info tiles) ---
  const gridItems = Array.from(element.querySelectorAll('.grid-item'));

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
  } else if (multiColItems.length > 0) {
    // Services/Solutions page cards - 2 or 3 column layout items with image + title + desc + CTA
    multiColItems.forEach((card) => {
      const imageCell = [];

      const img = card.querySelector('img.rwp-image, img');
      if (img) {
        const src = img.getAttribute('src') || '';
        const newImg = document.createElement('img');
        newImg.src = src.startsWith('//') ? `https:${src}` : src;
        newImg.alt = img.alt || '';
        imageCell.push(newImg);
      }

      const contentCell = [];

      const title = card.querySelector('.rwp-contentlayout-item__title, h3, h2');
      if (title) {
        const h3 = document.createElement('h3');
        h3.textContent = title.textContent.trim();
        contentCell.push(h3);
      }

      const desc = card.querySelector('.rwp-contentlayout-item__description');
      if (desc) {
        const p = document.createElement('p');
        p.innerHTML = desc.innerHTML.trim();
        contentCell.push(p);
      }

      const links = Array.from(card.querySelectorAll('.rwp-button__link, .rwp-webpart__links a'));
      links.forEach((link) => {
        const a = document.createElement('a');
        a.href = link.href || '';
        a.textContent = link.textContent.trim();
        contentCell.push(a);
      });

      if (imageCell.length > 0 && contentCell.length > 0) {
        cells.push([imageCell, contentCell]);
      } else if (contentCell.length > 0) {
        cells.push(contentCell);
      }
    });
  } else if (gridItems.length > 0) {
    // TileLayout grid items (stats, info tiles)
    gridItems.forEach((item) => {
      const desc = item.querySelector('.description');
      if (!desc) return;

      const contentCell = [];

      const heading = desc.querySelector('h2');
      if (heading) {
        const h3 = document.createElement('h3');
        h3.textContent = heading.textContent.trim();
        contentCell.push(h3);
      }

      const subtitle = desc.querySelector('h3');
      if (subtitle) {
        const p = document.createElement('p');
        p.textContent = subtitle.textContent.trim();
        contentCell.push(p);
      }

      const img = item.querySelector('img');
      const imageCell = [];
      if (img) imageCell.push(img);

      const link = item.querySelector('a');
      if (link) contentCell.push(link);

      if (imageCell.length > 0 && contentCell.length > 0) {
        cells.push([imageCell, contentCell]);
      } else if (contentCell.length > 0) {
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
