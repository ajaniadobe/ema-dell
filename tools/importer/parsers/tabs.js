/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs.
 * Base block: tabs.
 * Source: https://www.dell.com/en-us/shop/scc/sc/artificial-intelligence
 * Instances:
 *   #ai-customer-story-tabs (use case tabs with videos)
 *   #ai-ecosystem-tabs-container (partner ecosystem tabs with logo grids)
 *   #cpMFE-Tab (resources tabs with card carousels)
 * Generated: 2026-03-12 (Dell page is JS-rendered; selectors target fully-rendered DOM)
 *
 * Block library structure (2 columns):
 *   Each row: tab label (cell 1) | tab content (cell 2)
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find tab buttons and tab panes
  const tabButtons = Array.from(element.querySelectorAll('[role="tab"], .dds__tabs__tab'));
  const tabPanes = Array.from(element.querySelectorAll('[role="tabpanel"], .dds__tabs__pane'));

  if (tabButtons.length > 0 && tabPanes.length > 0) {
    tabButtons.forEach((tab, index) => {
      const label = tab.textContent.trim();
      const pane = tabPanes[index];

      if (label && pane) {
        cells.push([label, pane]);
      }
    });
  } else {
    // Fallback: look for tab-like structures with labels and content
    const tabItems = Array.from(element.querySelectorAll('.dds__tabs__tab'));
    const paneItems = Array.from(element.querySelectorAll('.dds__tabs__pane'));

    if (tabItems.length > 0) {
      tabItems.forEach((tab, index) => {
        const label = tab.textContent.trim();
        const pane = paneItems[index];
        if (label && pane) {
          cells.push([label, pane]);
        }
      });
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
