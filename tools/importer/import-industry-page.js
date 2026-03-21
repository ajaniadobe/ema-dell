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
  name: 'industry-page',
  description: 'Industry vertical page showcasing Dell solutions for a specific industry with video hero, stats carousels, industry trends cards, strategic goals, product portfolio, and FAQ',
  blocks: [
    {
      name: 'hero',
      instances: [
        "[id*='dellbuyercontentlayoutwebparts-1'].cp-container",
        ".cp-container:has(.cp-container-bgvideo):has(.rwp-contentlayout)"
      ]
    },
    {
      name: 'carousel',
      instances: [
        ".rwp-itemcarousel"
      ]
    },
    {
      name: 'cards',
      instances: [
        ".rwp-contentlayout:has(.rwp-contentlayout-item--columns-Four)",
        ".rwp-contentlayout:has(.rwp-contentlayout-item--columns-Three)"
      ]
    },
    {
      name: 'columns',
      instances: [
        ".rwp-contentlayout:has(.rwp-contentlayout-item--columns-Two)"
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
      name: 'Video Hero',
      selector: "[id*='dellbuyercontentlayoutwebparts-1'].cp-container",
      style: 'dark',
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'section-content',
      name: 'Content Sections',
      selector: ["#webparts > .cp-container"],
      style: null,
      blocks: ['carousel', 'cards', 'columns', 'hero'],
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
