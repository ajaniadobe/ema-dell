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
  name: 'services-hub-page',
  description: 'Top-level services overview page with video hero, stats counters, card grids, and customer story tiles',
  urls: [
    'https://www.dell.com/en-us/lp/dt/services'
  ],
  blocks: [
    {
      name: 'hero',
      instances: [
        "[id*='viewallservices-hero-banner-wp']"
      ]
    },
    {
      name: 'columns',
      instances: [
        "[id*='viewallservices-overview1-wp']:not([id*='-2']) .rwp-contentlayout"
      ]
    },
    {
      name: 'cards',
      instances: [
        "[id*='viewallservices-how-we-can-help-wp'] .rwp-contentlayout",
        "[id*='viewallservices-customers-wp'] .rwp-contentlayout",
        "[id*='viewallservices-tile'] .rwp-webpart-TileLayout",
        "[id*='viewallservices-industry-awards-wp'] .rwp-contentlayout"
      ]
    }
  ],
  sections: [
    {
      id: 'section-hero',
      name: 'Video Hero',
      selector: "[id*='viewallservices-hero-banner-wp']",
      style: 'dark',
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-forrester-banner',
      name: 'Forrester Study Banner',
      selector: "[id*='viewallservices-banner-wp']",
      style: 'dark',
      blocks: [],
      defaultContent: ["[id*='viewallservices-banner-wp'] .rwp-contentlayout"]
    },
    {
      id: 'section-what-we-offer',
      name: 'What We Offer',
      selector: "[id*='viewallservices-overview1-wp']:not([id*='-2'])",
      style: null,
      blocks: ['columns'],
      defaultContent: []
    },
    {
      id: 'section-service-credits',
      name: 'Service Credits Banner',
      selector: "[id*='viewallservices-overview1-wp-2']",
      style: null,
      blocks: [],
      defaultContent: ["[id*='viewallservices-overview1-wp-2'] .rwp-contentlayout"]
    },
    {
      id: 'section-how-we-can-help',
      name: 'How We Can Help',
      selector: "[id*='viewallservices-how-we-can-help-wp']",
      style: null,
      blocks: ['cards'],
      defaultContent: ["[id*='viewallservices-how-we-can-help-wp'] h2"]
    },
    {
      id: 'section-stats',
      name: 'Stats',
      selector: "[id*='viewallservices-customers-wp']",
      style: 'dark',
      blocks: ['cards'],
      defaultContent: ["[id*='viewallservices-customers-wp'] h2:first-of-type"]
    },
    {
      id: 'section-customer-stories',
      name: 'Customer Stories',
      selector: "[id*='viewallservices-tile']",
      style: null,
      blocks: ['cards'],
      defaultContent: ["[id*='viewallservices-tile'] h2"]
    },
    {
      id: 'section-awards',
      name: 'Awards & Achievements',
      selector: "[id*='viewallservices-industry-awards-wp']",
      style: 'light',
      blocks: ['cards'],
      defaultContent: ["[id*='viewallservices-industry-awards-wp'] h2:first-of-type"]
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
