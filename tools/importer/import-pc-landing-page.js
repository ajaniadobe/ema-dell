/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import dellCleanupTransformer from './transformers/dell-cleanup.js';
import dellSectionsTransformer from './transformers/dell-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'columns': columnsParser,
  'cards': cardsParser,
  'accordion': accordionParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  dellCleanupTransformer,
  dellSectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'pc-landing-page',
  description: 'Consumer PC product landing page with hero, feature highlights, product cards, comparison sections, and dark CTA banners',
  urls: [
    'https://www.dell.com/en-us/lp/aipc',
    'https://www.dell.com/en-us/lp/dell-pro-max-pcs',
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        // AIPC: traditional rwp-webpart hero
        "section[data-iid*='wp1']",
      ],
    },
    {
      name: 'hero',
      variant: 'center, full',
      instances: [
        // Pro Max: TailoredTemplatesMfe containing hero with H1 + video
        "section.rwp-webpart-TailoredTemplatesMfe[data-iid*='product-line-experience']",
      ],
    },
    {
      name: 'columns',
      instances: [
        // AIPC: feature highlight columns
        "section[data-iid='aipc-wp2']",
        // Pro Max: AI development content layout
        "section.rwp-webpart-ContentLayout[data-iid*='ai-dev']",
        // Pro Max: eGuides/Brochures content layout
        "section.rwp-webpart-ContentLayout[data-iid*='content-layout']",
      ],
      section: 'navy-blue',
    },
    {
      name: 'cards',
      instances: [
        // AIPC: use-case carousel, product portfolio, benefits, resources
        ".rwp-webpart-ItemCarousel[data-iid*='wp3']",
        "section[data-iid*='wp4-new-webpart']",
        "section[data-iid='aipc-wp11']",
        "section[data-iid='aipc-wp8']",
        "section[data-iid='aipc-wp9']",
        // Pro Max: resources carousel
        ".rwp-webpart-ItemCarousel[data-iid*='item-carousel']",
        // Pro Max: portfolio navigation
        "section.rwp-webpart-TailoredTemplatesMfe[data-iid*='product-navigation']",
      ],
      section: 'navy-blue',
    },
    {
      name: 'accordion',
      instances: [
        // Both pages: FAQ sections (broadened selector)
        ".rwp-webpart-FAQ[data-iid*='faq']",
      ],
      section: 'navy-blue',
    },
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero Section',
      selector: "div[id*='aipc-wp1-item-jan6-wp1'].cp-container",
      style: null,
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'section-feature',
      name: 'Feature Highlight',
      selector: "div[id*='aipc-wp2'].cp-container",
      style: 'navy-blue',
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'section-use-cases',
      name: 'Use Cases Cards',
      selector: "div[id*='aipc-wp3'].cp-container",
      style: 'navy-blue',
      blocks: ['cards'],
      defaultContent: [],
    },
    {
      id: 'section-products',
      name: 'Product Portfolio',
      selector: "div[id*='aipc-wp4'].cp-container",
      style: 'navy-blue',
      blocks: ['cards'],
      defaultContent: ['h2'],
    },
    {
      id: 'section-meet-family',
      name: 'Meet the Family',
      selector: "div[id*='aipc-wp5'].cp-container",
      style: 'navy-blue',
      blocks: [],
      defaultContent: ['h2', 'p', 'a'],
    },
    {
      id: 'section-benefits',
      name: 'Benefits Videos',
      selector: "div[id*='aipc-wp11'].cp-container",
      style: 'navy-blue',
      blocks: ['cards'],
      defaultContent: ['h2'],
    },
    {
      id: 'section-resources',
      name: 'Resource Cards',
      selector: "div[id*='aipc-wp8'].cp-container",
      style: 'navy-blue',
      blocks: ['cards'],
      defaultContent: [],
    },
    {
      id: 'section-faq',
      name: 'FAQ',
      selector: "div[id*='aipc-faq'].cp-container",
      style: 'navy-blue',
      blocks: ['accordion'],
      defaultContent: ['h2'],
    },
    {
      id: 'section-disclaimers',
      name: 'Disclaimers',
      selector: "div[id*='aipc-wp10'].cp-container",
      style: 'quartz-gray',
      blocks: [],
      defaultContent: ['p'],
    },
  ],
};

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
          variant: blockDef.variant || null,
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

    // 3. Parse each block using registered parsers, then apply variants
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          // Insert marker before element so we can find the created block table
          const marker = document.createComment('block-marker');
          block.element.parentNode.insertBefore(marker, block.element);

          parser(block.element, { document, url, params });

          // Apply variant: parser replaces source element with a <table>,
          // the table is now the next element sibling after our marker
          if (block.variant) {
            let node = marker.nextSibling;
            while (node && node.nodeType !== 1) node = node.nextSibling;
            if (node && node.tagName === 'TABLE') {
              const th = node.querySelector('th');
              if (th) {
                const blockName = th.textContent.trim();
                const expected = block.name.replace(/-/g, ' ').replace(/\s(.)/g, (m) => m.toUpperCase()).replace(/^(.)/, (m) => m.toUpperCase());
                if (blockName === expected) {
                  th.textContent = `${expected} (${block.variant})`;
                }
              }
            }
            marker.remove();
          } else {
            marker.remove();
          }
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
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
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
