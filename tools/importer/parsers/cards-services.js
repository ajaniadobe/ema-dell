/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards on Dell services pages.
 * Handles content layout items (3/4 column), grid tiles, and generic card patterns.
 *
 * Block library structure:
 *   Row per card: [image] | title + desc + CTA
 */
export default function parse(element, { document }) {
  const cells = [];

  // --- Pattern A: ContentLayout items (4-column, e.g. "How we can help") ---
  const contentLayoutFour = Array.from(
    element.querySelectorAll('.rwp-contentlayout-item--columns-Four')
  );

  // --- Pattern B: ContentLayout items (3-column, e.g. stats or awards) ---
  const contentLayoutThree = Array.from(
    element.querySelectorAll('.rwp-contentlayout-item--columns-Three')
  );

  // --- Pattern C: Grid tiles (customer story tiles) ---
  const gridItems = Array.from(element.querySelectorAll('.grid .grid-item'));

  const contentLayoutItems = contentLayoutFour.length > 0 ? contentLayoutFour : contentLayoutThree;

  if (contentLayoutItems.length > 0) {
    contentLayoutItems.forEach((card) => {
      const img = card.querySelector('.rwp-contentlayout-item__visual-container img.rwp-image');
      const svgIcon = card.querySelector('.rwp-contentlayout-item__visual-container svg');
      const title = card.querySelector('h2, h3');
      const desc = card.querySelector('.rwp-contentlayout-item__description');
      const ctaLink = card.querySelector('.rwp-button__link, .rwp-webpart__links a');

      const imageCell = [];
      if (img) {
        const src = img.getAttribute('src') || '';
        const newImg = document.createElement('img');
        newImg.src = src.startsWith('//') ? `https:${src}` : src;
        newImg.alt = img.alt || '';
        imageCell.push(newImg);
      } else if (svgIcon) {
        const iconName = svgIcon.getAttribute('data-icon-name') || 'icon';
        const newImg = document.createElement('img');
        newImg.src = `./icons/${iconName}.svg`;
        newImg.alt = iconName;
        imageCell.push(newImg);
      }

      const contentCell = [];
      if (title) {
        const h = document.createElement('h3');
        h.textContent = title.textContent.trim();
        contentCell.push(h);
      }
      if (desc) {
        const p = document.createElement('p');
        p.innerHTML = desc.innerHTML.trim();
        contentCell.push(p);
      }
      if (ctaLink) contentCell.push(ctaLink);

      if (imageCell.length > 0 && contentCell.length > 0) {
        cells.push([imageCell, contentCell]);
      } else if (contentCell.length > 0) {
        cells.push(contentCell);
      }
    });
  } else if (gridItems.length > 0) {
    // Grid tile cards (customer stories)
    gridItems.forEach((tile) => {
      const img = tile.querySelector('img');
      const title = tile.querySelector('h3, h2');
      const desc = tile.querySelector('[class*="description"]');
      const link = tile.querySelector('a[href]');

      const imageCell = [];
      if (img) {
        const src = img.getAttribute('src') || '';
        const newImg = document.createElement('img');
        newImg.src = src.startsWith('//') ? `https:${src}` : src;
        newImg.alt = img.alt || '';
        imageCell.push(newImg);
      }

      const contentCell = [];
      if (title) {
        const h = document.createElement('h3');
        h.textContent = title.textContent.trim();
        contentCell.push(h);
      }
      if (desc) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        contentCell.push(p);
      }
      if (link) contentCell.push(link);

      if (imageCell.length > 0 && contentCell.length > 0) {
        cells.push([imageCell, contentCell]);
      } else if (contentCell.length > 0) {
        cells.push(contentCell);
      }
    });
  } else {
    // Fallback: generic card patterns
    const cardItems = Array.from(
      element.querySelectorAll('.cards-alignment, [class*="card"], .rwp-contentlayout-item')
    );
    cardItems.forEach((card) => {
      const img = card.querySelector('img');
      const title = card.querySelector('h2, h3, h4, strong');
      const desc = card.querySelector('p, [class*="desc"]');
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
