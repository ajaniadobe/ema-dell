/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import dellCleanupTransformer from './transformers/dell-cleanup.js';
import dellSectionsTransformer from './transformers/dell-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'cards': cardsParser,
  'accordion': accordionParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'product-listing-page',
  description: 'Product listing/search results page with hero, showcase banners, and FAQ. Dynamic product grid is excluded.',
  urls: [
    'https://www.dell.com/en-us/shop/scc/sc/laptops',
    'https://www.dell.com/en-us/shop/dell-laptops/scr/laptops',
    'https://www.dell.com/en-us/shop/desktop-computers/scr/desktops'
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        '.tnt-hero-section',
        '.plp-scr-banner'
      ]
    },
    {
      name: 'cards',
      instances: [
        '#showcase-banner-main-container'
      ]
    },
    {
      name: 'accordion',
      instances: [
        '#scr-faq-content'
      ]
    }
  ],
  sections: [
    {
      id: 'section-tnt-hero',
      name: 'TNT Video Hero',
      selector: '.tnt-hero-section',
      style: 'dark',
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-scr-banner',
      name: 'Category Banner',
      selector: '.plp-scr-banner',
      style: 'dark',
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-showcase-banner',
      name: 'Showcase Banners',
      selector: '#showcase-banner-main-container',
      style: 'dark',
      blocks: ['cards'],
      defaultContent: []
    },
    {
      id: 'section-faq',
      name: 'FAQ',
      selector: '#scr-faq-content',
      style: null,
      blocks: ['accordion'],
      defaultContent: ['#scr-faq-content h2', '#scr-faq-content > .scr-show-more']
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
