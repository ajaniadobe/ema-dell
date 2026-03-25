/* eslint-disable */
/* global WebImporter */
/**
 * Parser for agreements block.
 * Extracts partner agreement badges (Windows 11, Intel Core, etc.)
 * from Dell's .cp-agreements-container.
 *
 * Content model:
 *   Each row = one agreement:
 *     Col 1: Logo image (linked)
 *     Col 2: Optional description text + learn more link
 */
export default function parse(element, { document }) {
  const cells = [];

  const agreements = element.querySelectorAll('.cp-agreements-agreement');
  agreements.forEach((agreement) => {
    const logoDiv = agreement.querySelector('.cp-agreements-logo');
    const descDiv = agreement.querySelector('.cp-agreements-description');

    const row = [];

    // Col 1: Logo image with link
    if (logoDiv) {
      const link = logoDiv.querySelector('a');
      const img = logoDiv.querySelector('img');
      if (img && link) {
        const a = document.createElement('a');
        a.href = link.href;
        const newImg = document.createElement('img');
        newImg.src = img.src?.startsWith('//') ? `https:${img.src}` : img.src;
        newImg.alt = img.alt || '';
        a.appendChild(newImg);
        row.push(a);
      } else if (img) {
        const newImg = document.createElement('img');
        newImg.src = img.src?.startsWith('//') ? `https:${img.src}` : img.src;
        newImg.alt = img.alt || '';
        row.push(newImg);
      }
    }

    // Col 2: Description text + link (optional)
    if (descDiv) {
      const container = document.createElement('div');
      const textDiv = descDiv.querySelector('div');
      const link = descDiv.querySelector('a');
      if (textDiv) {
        const p = document.createElement('p');
        p.textContent = textDiv.textContent.trim();
        container.appendChild(p);
      }
      if (link) {
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.textContent.trim();
        container.appendChild(a);
      }
      if (container.children.length) row.push(container);
    }

    if (row.length > 0) cells.push(row);
  });

  if (cells.length > 0) {
    const block = WebImporter.Blocks.createBlock(document, { name: 'agreements', cells });
    element.replaceWith(block);
  }
}
