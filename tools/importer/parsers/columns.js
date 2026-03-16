/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns.
 * Base block: columns.
 * Source: https://www.dell.com/en-us/lp/dt/customer-stories-mclaren-racing
 * Instance: [id*='dellbuyercontentlayoutwebparts-2'] .rwp-contentlayout
 *   (4-column layout: logo+info, Vision, Solution, Impact)
 *
 * Block library structure:
 *   Each row has N cells (one per column)
 *   Each cell: text, images, or inline elements
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find all column items within the content layout
  const columnItems = Array.from(
    element.querySelectorAll('.rwp-contentlayout-item')
  );

  if (columnItems.length > 0) {
    // Build one row with N columns
    const row = [];

    columnItems.forEach((col) => {
      const cellContent = [];

      // Image (e.g., Dell/NVIDIA lockup logo)
      const img = col.querySelector('img.rwp-image, img');
      if (img) {
        const src = img.getAttribute('src') || '';
        const newImg = document.createElement('img');
        newImg.src = src.startsWith('//') ? `https:${src}` : src;
        newImg.alt = img.alt || '';
        cellContent.push(newImg);
      }

      // Title (h3 heading)
      const title = col.querySelector('.rwp-contentlayout-item__title, h3, h2');
      if (title) {
        const h3 = document.createElement('h3');
        h3.textContent = title.textContent.trim();
        cellContent.push(h3);
      }

      // Description
      const desc = col.querySelector('.rwp-contentlayout-item__description');
      if (desc) {
        const p = document.createElement('p');
        p.innerHTML = desc.innerHTML;
        cellContent.push(p);
      }

      // CTA links
      const links = Array.from(col.querySelectorAll('.rwp-button__link, .rwp-webpart__links a'));
      links.forEach((link) => cellContent.push(link));

      row.push(cellContent);
    });

    cells.push(row);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
