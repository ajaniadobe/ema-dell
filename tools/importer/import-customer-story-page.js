/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS
import dellCleanupTransformer from './transformers/dell-cleanup.js';
import dellSectionsTransformer from './transformers/dell-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'columns': columnsParser,
  'cards': cardsParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'customer-story-page',
  description: 'Customer story landing page featuring a specific Dell customer case study with hero, video, testimonials, and product highlights',
  urls: [
    'https://www.dell.com/en-us/lp/dt/customer-stories-mclaren-racing'
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        "[id*='dellbuyercontentlayoutwebparts-1'].cp-container"
      ]
    },
    {
      name: 'columns',
      instances: [
        "[id*='dellbuyercontentlayoutwebparts-2'] .rwp-contentlayout"
      ]
    },
    {
      name: 'cards',
      instances: [
        "[id*='dellbuyercontentlayoutwebparts-4'] .rwp-contentlayout",
        ".rwp-itemcarousel"
      ]
    }
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero',
      selector: "[id*='dellbuyercontentlayoutwebparts-1'].cp-container",
      style: 'dark',
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-customer-overview',
      name: 'Customer Overview',
      selector: "[id*='dellbuyercontentlayoutwebparts-2'].cp-container",
      style: null,
      blocks: ['columns'],
      defaultContent: []
    },
    {
      id: 'section-quote-video',
      name: 'Quote & Video',
      selector: "[id*='dellbuyercontentlayoutwebparts-3'].cp-container",
      style: 'dark',
      blocks: [],
      defaultContent: [
        "[data-iid*='dellbuyercontentlayoutitems-6']",
        "[data-iid*='dellbuyercontentlayoutitems-7']"
      ]
    },
    {
      id: 'section-business-results',
      name: 'Business Results',
      selector: "[id*='dellbuyercontentlayoutwebparts-4'].cp-container",
      style: null,
      blocks: ['cards'],
      defaultContent: [
        "[id*='dellbuyercontentlayoutwebparts-4'] h2"
      ]
    },
    {
      id: 'section-products',
      name: 'Products',
      selector: "[id*='dellbuyeritemcarouselwebparts-1'].cp-container",
      style: 'dark',
      blocks: ['cards'],
      defaultContent: [
        '.rwp-webpart__subtitle'
      ]
    },
    {
      id: 'section-cta',
      name: 'CTA',
      selector: "[id*='dellbuyercontentlayoutwebparts-6'].cp-container",
      style: 'dark',
      blocks: [],
      defaultContent: [
        "[data-iid*='dellbuyercontentlayoutitems-13']"
      ]
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
