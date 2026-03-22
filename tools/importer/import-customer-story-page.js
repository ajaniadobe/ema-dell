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
        "[id*='dellbuyercontentlayoutwebparts-1'].cp-container",
        "[id*='hero-banner'].cp-container",
        "[data-cs-section='hero']"
      ]
    },
    {
      name: 'columns',
      instances: [
        "[id*='dellbuyercontentlayoutwebparts-2'] .rwp-contentlayout",
        "[data-cs-section='columns'] .rwp-contentlayout",
        "[data-cs-section='columns']"
      ]
    },
    {
      name: 'cards',
      instances: [
        "[id*='dellbuyercontentlayoutwebparts-4'] .rwp-contentlayout",
        ".rwp-itemcarousel",
        "[data-cs-section='cards'] .rwp-contentlayout",
        "[data-cs-section='cards']",
        "[data-cs-section='carousel']"
      ]
    }
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero',
      selector: [
        "[id*='dellbuyercontentlayoutwebparts-1'].cp-container",
        "[id*='hero-banner'].cp-container",
        "[data-cs-section='hero']"
      ],
      style: 'dark',
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-customer-overview',
      name: 'Customer Overview',
      selector: [
        "[id*='dellbuyercontentlayoutwebparts-2'].cp-container",
        "[data-cs-section='columns']"
      ],
      style: null,
      blocks: ['columns'],
      defaultContent: []
    },
    {
      id: 'section-quote-video',
      name: 'Quote & Video',
      selector: [
        "[id*='dellbuyercontentlayoutwebparts-3'].cp-container",
        "[id*='quote'].cp-container",
        "[data-cs-section='quote']"
      ],
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
      selector: [
        "[id*='dellbuyercontentlayoutwebparts-4'].cp-container",
        "[id*='icons'].cp-container",
        "[data-cs-section='cards']"
      ],
      style: null,
      blocks: ['cards'],
      defaultContent: [
        "[id*='dellbuyercontentlayoutwebparts-4'] h2",
        "[data-cs-section='cards'] h2"
      ]
    },
    {
      id: 'section-products',
      name: 'Products',
      selector: [
        "[id*='dellbuyeritemcarouselwebparts-1'].cp-container",
        "[id*='item-carousel'].cp-container",
        "[data-cs-section='carousel']"
      ],
      style: 'dark',
      blocks: ['cards'],
      defaultContent: [
        '.rwp-webpart__subtitle'
      ]
    },
    {
      id: 'section-cta',
      name: 'CTA',
      selector: [
        "[id*='dellbuyercontentlayoutwebparts-6'].cp-container",
        "[id*='explore-cta'].cp-container",
        "[data-cs-section='cta']"
      ],
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
 * Annotate cp-container sections with data-cs-section attributes
 * for positional matching when standard ID selectors don't match.
 * All customer story pages follow the same 6-section structure:
 *   1. Hero (1-col, dark) 2. Columns (4-col, light) 3. Quote (1-col, dark)
 *   4. Cards/Business Results (4-col, light) 5. Carousel (dark) 6. CTA (1-col, dark)
 */
function annotateSections(document) {
  const cpContainers = Array.from(document.querySelectorAll('.cp-container'));
  if (cpContainers.length === 0) return;

  // Check if standard selectors would already work
  const hasStandard = document.querySelector("[id*='dellbuyercontentlayoutwebparts-1'].cp-container");
  if (hasStandard) {
    console.log('Standard ID selectors match - skipping positional annotation');
    return;
  }

  console.log(`Annotating ${cpContainers.length} sections via positional analysis`);

  let fourColCount = 0;

  cpContainers.forEach((container, index) => {
    const hasCarousel = container.querySelector('.rwp-itemcarousel, .rwp-ic-slide');
    const has4Col = container.querySelector('.rwp-contentlayout-item--columns-Four');

    if (index === 0) {
      container.setAttribute('data-cs-section', 'hero');
    } else if (has4Col) {
      fourColCount++;
      if (fourColCount === 1) {
        container.setAttribute('data-cs-section', 'columns');
      } else {
        container.setAttribute('data-cs-section', 'cards');
      }
    } else if (hasCarousel) {
      container.setAttribute('data-cs-section', 'carousel');
    } else if (index === cpContainers.length - 1) {
      container.setAttribute('data-cs-section', 'cta');
    } else if (!container.getAttribute('data-cs-section')) {
      // Remaining 1-col dark sections are quote/video
      container.setAttribute('data-cs-section', 'quote');
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

    // 1.5 Annotate sections for positional matching (handles non-standard IDs)
    annotateSections(document);

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
