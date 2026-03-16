/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';
import tabsParser from './parsers/tabs.js';
import carouselParser from './parsers/carousel.js';
import accordionParser from './parsers/accordion.js';
import valuePillarsParser from './parsers/value-pillars.js';

// TRANSFORMER IMPORTS
import dellCleanupTransformer from './transformers/dell-cleanup.js';
import dellSectionsTransformer from './transformers/dell-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'cards': cardsParser,
  'tabs': tabsParser,
  'carousel': carouselParser,
  'accordion': accordionParser,
  'value-pillars': valuePillarsParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'product-category-page',
  description: 'Product category page showcasing a Dell product line with hero, product cards, tabs, and resources',
  urls: [
    'https://www.dell.com/en-us/shop/scc/sc/apex',
    'https://www.dell.com/en-us/shop/scc/sc/servers',
    'https://www.dell.com/en-us/shop/scc/sc/storage-products',
    'https://www.dell.com/en-us/shop/scc/sc/cyber-resilience',
    'https://www.dell.com/en-us/shop/scc/sc/private-cloud-solutions',
    'https://www.dell.com/en-us/shop/scc/sc/networking-products'
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        '#show-nav-bar > section:first-child'
      ]
    },
    {
      name: 'cards',
      instances: [
        '#floating-cards',
        '#number-claim',
        '.portfolio-container'
      ]
    },
    {
      name: 'value-pillars',
      instances: [
        '.value-pillars-container'
      ]
    },
    {
      name: 'accordion',
      instances: [
        '#immersive-learning',
        '#accordion-FAQ'
      ]
    },
    {
      name: 'carousel',
      instances: [
        '#announcement-carousel-no-arrows'
      ]
    },
    {
      name: 'tabs',
      instances: [
        '#cpMFE-Tab'
      ]
    }
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero',
      selector: '#show-nav-bar',
      style: 'dark',
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-cards',
      name: 'Feature Cards',
      selector: '#floating-cards',
      style: 'dark',
      blocks: ['cards'],
      defaultContent: []
    },
    {
      id: 'section-stats',
      name: 'Stats',
      selector: '#number-claim',
      style: null,
      blocks: ['cards'],
      defaultContent: []
    },
    {
      id: 'section-benefits',
      name: 'Benefits',
      selector: '#benefits',
      style: 'dark',
      blocks: ['cards'],
      defaultContent: []
    },
    {
      id: 'section-portfolio',
      name: 'Product Portfolio',
      selector: ['#portfolio', '#solutions'],
      style: null,
      blocks: ['cards'],
      defaultContent: []
    },
    {
      id: 'section-demo',
      name: 'Interactive Demo',
      selector: '#demo',
      style: 'dark',
      blocks: ['accordion'],
      defaultContent: []
    },
    {
      id: 'section-featured',
      name: 'Featured Announcements',
      selector: '#featured',
      style: null,
      blocks: ['carousel'],
      defaultContent: []
    },
    {
      id: 'section-resources',
      name: 'Resources',
      selector: '#resources',
      style: null,
      blocks: ['tabs'],
      defaultContent: []
    },
    {
      id: 'section-ownership',
      name: 'Ownership',
      selector: '#ownership',
      style: null,
      blocks: [],
      defaultContent: ['#ownership']
    },
    {
      id: 'section-faqs',
      name: 'FAQs',
      selector: '.disclaimerFAQcontainer',
      style: null,
      blocks: ['accordion'],
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
