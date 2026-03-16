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
  name: 'services-category-page',
  description: 'Services category overview page with static hero, card carousels for sub-categories, process icon grid, and customer story carousel',
  urls: [
    'https://www.dell.com/en-us/lp/dt/professional-services',
    'https://www.dell.com/en-us/lp/dt/lifecycle-services'
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        "[id*='hero-banner-wp']"
      ]
    },
    {
      name: 'carousel',
      instances: [
        ".rwp-itemcarousel"
      ]
    },
    {
      name: 'columns',
      instances: [
        "[id*='section1-wp'] .rwp-contentlayout"
      ]
    },
    {
      name: 'cards',
      instances: [
        "[id*='section4-wp'] .rwp-contentlayout",
        "[id*='dt-awards'] .rwp-contentlayout"
      ]
    }
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Hero Banner',
      selector: "[id*='hero-banner-wp']",
      style: 'dark',
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-outcomes-carousel',
      name: 'Service Outcomes',
      selector: "[id*='section2']",
      style: null,
      blocks: ['carousel'],
      defaultContent: []
    },
    {
      id: 'section-what-we-offer',
      name: 'What We Offer',
      selector: "[id*='section1-wp']",
      style: null,
      blocks: ['columns'],
      defaultContent: []
    },
    {
      id: 'section-it-potential',
      name: 'IT Potential',
      selector: "[id*='section3-wp']",
      style: 'dark',
      blocks: [],
      defaultContent: ["[id*='section3-wp'] .rwp-contentlayout"]
    },
    {
      id: 'section-service-phases',
      name: 'Service Phases',
      selector: "[id*='section4-wp']",
      style: 'dark',
      blocks: ['cards'],
      defaultContent: []
    },
    {
      id: 'section-customer-stories',
      name: 'Customer Stories',
      selector: "[id*='section']:has(.rwp-itemcarousel):not([id*='section2'])",
      style: null,
      blocks: ['carousel'],
      defaultContent: []
    },
    {
      id: 'section-awards',
      name: 'Awards',
      selector: "[id*='dt-awards']",
      style: null,
      blocks: ['cards'],
      defaultContent: ["[id*='dt-awards'] h2"]
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
