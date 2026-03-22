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

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'columns': columnsParser,
  'cards': cardsParser,
  'carousel': carouselParser,
  'accordion': accordionParser,
};

// PAGE TEMPLATE CONFIGURATION
// Alternative industry pages (Smart Cities, State & Local Government, Federal Government IT)
// use diverse container types: hotspots, tile grids, tab-nested content, dual FAQs.
// Unlike standard industry pages, container IDs vary across pages, so sections
// are detected dynamically from each .cp-container[id*='dellbuyer'] element.
const PAGE_TEMPLATE = {
  name: 'industry-page-alt',
  description: 'Alternative industry page layout with diverse container types and dynamic section detection',
  blocks: [
    {
      name: 'hero',
      instances: [
        ".cp-container:has(.cp-container-bgvideo):has(.rwp-contentlayout)",
        ".cp-container[class*='bg-video-True']:has(.rwp-contentlayout)"
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
        ".cp-container[id*='faqwebparts']"
      ]
    }
  ],
  sections: []
};

// THEME-TO-STYLE MAPPING for dynamic section detection
// Maps Dell CP container themes to EDS section styles
const THEME_STYLE_MAP = {
  'JetBlack': 'dark',
  'NavyBlue': 'dark',
  'DarkGray': 'dark',
  'StandardWhite': null,
  'QuartzGray': null,
};

// TRANSFORMER REGISTRY (no dell-sections - sections handled dynamically)
const transformers = [
  dellCleanupTransformer,
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

/**
 * Dynamic section handler for pages with variable container structures.
 * Finds all .cp-container[id*='dellbuyer'] elements and inserts section breaks
 * and Section Metadata blocks based on the container's theme class.
 */
function insertDynamicSections(element, document) {
  const containers = element.querySelectorAll('.cp-container[id*="dellbuyer"]');
  if (containers.length < 2) return;

  console.log(`Dynamic sections: found ${containers.length} cp-containers`);

  // Process in reverse order to avoid index shifts
  const containerArray = Array.from(containers);
  for (let i = containerArray.length - 1; i >= 0; i--) {
    const container = containerArray[i];

    // Determine style from theme class
    const themeMatch = container.className.match(/cp-container-d--theme-(\w+)/);
    const theme = themeMatch ? themeMatch[1] : null;
    const style = theme ? (THEME_STYLE_MAP[theme] || null) : null;

    // Add Section Metadata block if section has a dark style
    if (style) {
      const sectionMetadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style },
      });
      container.after(sectionMetadata);
    }

    // Add <hr> before container (except the first one)
    if (i > 0) {
      const hr = document.createElement('hr');
      container.before(hr);
    }
  }
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

    // Dynamic section breaks (replaces dell-sections transformer)
    insertDynamicSections(main, document);

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
