/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';
import carouselParser from './parsers/carousel.js';
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import dellCleanupTransformer from './transformers/dell-cleanup.js';
import dellSectionsTransformer from './transformers/dell-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'columns': columnsParser,
  'cards': cardsParser,
  'carousel': carouselParser,
  'accordion': accordionParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'solutions-landing-page',
  description: 'Solutions landing page promoting Dell solution offerings with hero, feature sections, and CTAs',
  urls: [
    'https://www.dell.com/en-us/lp/dt/payment-solutions',
    'https://www.dell.com/en-us/lp/dt/devops-solutions',
    'https://www.dell.com/en-us/lp/disaggregated-infrastructure',
    'https://www.dell.com/en-us/lp/dt/energy-efficient-data-center',
    'https://www.dell.com/en-us/lp/enterprise-upgrades'
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        "[id*='hero-wp']",
        "[id*='hero-banner-wp']",
        "#webparts > .cp-container:first-child:has(.rwp-contentlayout-item--columns-One)"
      ]
    },
    {
      name: 'columns',
      instances: [
        ".rwp-contentlayout:has(.rwp-contentlayout-item--columns-Two)"
      ]
    },
    {
      name: 'cards',
      instances: [
        ".rwp-contentlayout:has(.rwp-contentlayout-item--columns-Three)",
        ".rwp-contentlayout:has(.rwp-contentlayout-item--columns-Four)",
        ".rwp-webpart-TileLayout"
      ]
    },
    {
      name: 'carousel',
      instances: [
        ".rwp-itemcarousel"
      ]
    },
    {
      name: 'accordion',
      instances: [
        ".cp-container[id*='faq']"
      ]
    }
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero',
      selector: ["[id*='hero-wp']", "[id*='hero-banner-wp']", "#webparts > .cp-container:first-child"],
      style: 'dark',
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-content',
      name: 'Content Sections',
      selector: ["#webparts > .cp-tabset", "#webparts > .cp-container"],
      style: null,
      blocks: ['cards', 'columns', 'carousel'],
      defaultContent: []
    },
    {
      id: 'section-faq',
      name: 'FAQ',
      selector: ".cp-container[id*='faq']",
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
