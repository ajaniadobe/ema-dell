/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';
import tabsParser from './parsers/tabs.js';
import carouselParser from './parsers/carousel.js';
import accordionParser from './parsers/accordion.js';

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
};

// PAGE TEMPLATE CONFIGURATION (embedded from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'ai-solutions-page',
  urls: [
    'https://www.dell.com/en-us/shop/scc/sc/artificial-intelligence',
  ],
  description: 'Dell AI solutions category page showcasing artificial intelligence products and services',
  blocks: [
    {
      name: 'hero',
      instances: ['#hero-ai', '.live-optics-section'],
    },
    {
      name: 'cards',
      instances: ['#floating-cards.theme-cards-banner-dark', '#floating-cards.theme-cards-banner-light', '.value-pillars-container'],
    },
    {
      name: 'tabs',
      instances: ['#ai-customer-story-tabs', '#ai-ecosystem-tabs-container', '#cpMFE-Tab'],
    },
    {
      name: 'carousel',
      instances: ['#ai-infrastructure-carousel'],
    },
    {
      name: 'accordion',
      instances: ['#accordion-FAQ'],
    },
  ],
  sections: [
    { id: 'section-hero', name: 'Hero', selector: '.ai-hero-container', style: 'dark', blocks: ['hero'], defaultContent: [] },
    { id: 'section-outcomes', name: 'Customer Outcomes', selector: '#ai-outcomes', style: 'dark', blocks: ['cards'], defaultContent: ['.outcomes-header'] },
    { id: 'section-customer-stories', name: 'AI Use Cases', selector: '#ai-customerstory', style: null, blocks: ['tabs'], defaultContent: ['.customerstory-header'] },
    { id: 'section-ai-factory', name: 'Dell AI Factory', selector: '#ai-factory-dell', style: null, blocks: [], defaultContent: ['.ai-factory-header-wrapper', '.ai-factory-content-wrapper', '.ai-factory-animation-wrapper', '.ai-factory-button-wrapper'] },
    { id: 'section-live-optics', name: 'AI Solutions Explorer CTA', selector: '#ai-liveOptics', style: 'accent', blocks: ['hero'], defaultContent: [] },
    { id: 'section-data-ai', name: 'Data for AI', selector: '#ai-data', style: null, blocks: ['cards'], defaultContent: ['#ai-data > .outcomes-header'] },
    { id: 'section-infrastructure', name: 'AI Infrastructure', selector: '#ai-infrastructure', style: null, blocks: ['carousel'], defaultContent: [] },
    { id: 'section-ecosystem', name: 'AI Partner Ecosystem', selector: '#ai-ecosystem', style: null, blocks: ['tabs'], defaultContent: ['.ai-ecosystem-row'] },
    { id: 'section-services', name: 'Professional Services', selector: '.vpmfe-container', style: 'light', blocks: ['cards'], defaultContent: ['.vpmfe-header-container'] },
    { id: 'section-resources', name: 'AI Resources', selector: '#cpMFE-Tab', style: null, blocks: ['tabs'], defaultContent: ['.cpmfe-title'] },
    { id: 'section-faqs', name: 'FAQs', selector: '.disclaimerFAQcontainer', style: null, blocks: ['accordion'], defaultContent: [] },
  ],
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
 * Find all blocks on the page based on template configuration
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

// EXPORT DEFAULT CONFIGURATION
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

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
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
