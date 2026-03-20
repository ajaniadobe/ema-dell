/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';
import columnsParser from './parsers/columns.js';
import tabsParser from './parsers/tabs.js';
import carouselParser from './parsers/carousel.js';
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import dellCleanupTransformer from './transformers/dell-cleanup.js';
import dellSectionsTransformer from './transformers/dell-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'cards': cardsParser,
  'columns': columnsParser,
  'tabs': tabsParser,
  'carousel': carouselParser,
  'accordion': accordionParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'cp-landing-page',
  description: 'Solutions landing page built on Dell CP framework with themed containers and tab-based navigation',
  urls: [
    'https://www.dell.com/en-us/lp/dell-video-conferencing-room-solutions',
    'https://www.dell.com/en-us/lp/thin-client-solutions'
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        '.cp-container[id*="hero"]',
        '.cp-container:has(.rwp-contentlayout-item--bgImage)'
      ]
    },
    {
      name: 'cards',
      instances: [
        '.cp-container:has(.rwp-webpart-TileLayout)',
        '.cp-container:has(.rwp-contentlayout-item--columns-Three)',
        '.cp-container:has(.rwp-contentlayout-item--columns-Four)'
      ]
    },
    {
      name: 'columns',
      instances: [
        '.cp-container:has(.rwp-contentlayout-item--columns-Two)'
      ]
    },
    {
      name: 'tabs',
      instances: [
        '.cp-tabset'
      ]
    },
    {
      name: 'carousel',
      instances: [
        '.cp-container:has(.rwp-itemcarousel)'
      ]
    },
    {
      name: 'accordion',
      instances: [
        '.cp-container:has(.dds__accordion)'
      ]
    }
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero Banner',
      selector: '.cp-container[id*="hero"]',
      style: 'navy-blue',
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-tabset-1',
      name: 'Product Overview Tabs',
      selector: '.cp-tabset:first-of-type',
      style: null,
      blocks: ['tabs', 'cards', 'columns', 'carousel'],
      defaultContent: []
    },
    {
      id: 'section-content',
      name: 'Content Sections',
      selector: '#webparts > .cp-container',
      style: null,
      blocks: ['columns', 'hero'],
      defaultContent: []
    },
    {
      id: 'section-tabset-2',
      name: 'Product Catalog Tabs',
      selector: '.cp-tabset:last-of-type',
      style: 'navy-blue',
      blocks: ['tabs', 'cards'],
      defaultContent: []
    },
    {
      id: 'section-cta',
      name: 'CTA Banner',
      selector: '#webparts > .cp-container:last-of-type',
      style: 'navy-blue',
      blocks: ['hero'],
      defaultContent: []
    }
  ]
};

// TRANSFORMER REGISTRY
const transformers = [
  dellCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [dellSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
