/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';
import carouselParser from './parsers/carousel.js';

// TRANSFORMER IMPORTS
import dellCleanupTransformer from './transformers/dell-cleanup.js';
import dellSectionsTransformer from './transformers/dell-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'columns': columnsParser,
  'cards': cardsParser,
  'carousel': carouselParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'services-detail-page',
  description: 'Specific service offering page with hero banner, alternating image-text content layouts, feature sections, and resource carousel',
  urls: [
    'https://www.dell.com/en-us/lp/dt/training-and-certification',
    'https://www.dell.com/en-us/lp/dt/technologies-and-tools',
    'https://www.dell.com/en-us/lp/dt/artificial-intelligence-services',
    'https://www.dell.com/en-us/lp/dt/multicloud-services',
    'https://www.dell.com/en-us/lp/dt/modern-workforce',
    'https://www.dell.com/en-us/lp/dt/security-and-resiliency',
    'https://www.dell.com/en-us/lp/dt/deployment-services',
    'https://www.dell.com/en-us/lp/dt/managed-services',
    'https://www.dell.com/en-us/lp/dt/support-services',
    'https://www.dell.com/en-us/lp/dt/recovery-recycling-services',
    'https://www.dell.com/en-us/lp/dt/automation-platform'
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        "[id*='hero-banner-wp']",
        "[id*='dellbuyerbannercarouselwp']"
      ]
    },
    {
      name: 'columns',
      instances: [
        ".cp-container:has(.rwp-contentlayout-item--columns-One):has(img):has(h3)"
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
    }
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero Banner',
      selector: ["[id*='hero-banner-wp']", "[id*='dellbuyerbannercarouselwp']"],
      style: 'dark',
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-intro',
      name: 'Introduction',
      selector: "#webparts > .cp-container:nth-child(2)",
      style: null,
      blocks: [],
      defaultContent: [".rwp-contentlayout-item--columns-One"]
    },
    {
      id: 'section-content',
      name: 'Content Sections',
      selector: "#webparts > .cp-container",
      style: null,
      blocks: ['columns', 'cards'],
      defaultContent: []
    },
    {
      id: 'section-resource-carousel',
      name: 'Resource Carousel',
      selector: ".cp-container:has(.rwp-itemcarousel)",
      style: 'dark',
      blocks: ['carousel'],
      defaultContent: []
    }
  ]
};

// TRANSFORMER REGISTRY
const transformers = [
  dellCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [dellSectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
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
    executeTransformers('beforeTransform', main, payload);
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try { parser(block.element, { document, url, params }); }
        catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
      } else { console.warn(`No parser found for block: ${block.name}`); }
    });
    executeTransformers('afterTransform', main, payload);
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );
    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};
