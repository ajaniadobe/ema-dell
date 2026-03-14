var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-ai-solutions-page.js
  var import_ai_solutions_page_exports = {};
  __export(import_ai_solutions_page_exports, {
    default: () => import_ai_solutions_page_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const cells = [];
    const video = element.querySelector("video");
    const bgImg = element.querySelector(".live-optics-img-banner, img.live-optics-img-banner");
    if (video) {
      const posterUrl = video.getAttribute("poster");
      if (posterUrl) {
        const img = document.createElement("img");
        img.src = posterUrl.startsWith("//") ? `https:${posterUrl}` : posterUrl;
        img.alt = "Hero background";
        cells.push([img]);
      }
    } else if (bgImg) {
      const realSrc = bgImg.getAttribute("data-src") || bgImg.getAttribute("src") || "";
      if (realSrc && !realSrc.startsWith("data:")) {
        const img = document.createElement("img");
        img.src = realSrc.startsWith("//") ? `https:${realSrc}` : realSrc;
        img.alt = bgImg.alt || "Hero background";
        cells.push([img]);
      }
    }
    const contentCell = [];
    const heading = element.querySelector("h1, h2");
    if (heading) contentCell.push(heading);
    const desc = element.querySelector(
      ".dds_Hero-ai-content, .live-optics-description, p:not(.faq-question)"
    );
    if (desc && desc !== heading) contentCell.push(desc);
    const ctaLinks = Array.from(
      element.querySelectorAll(
        ".ai-uc-hero-btn, .live-optics-button, a.dds__button, a.live-optics-button"
      )
    );
    ctaLinks.forEach((link) => contentCell.push(link));
    if (contentCell.length > 0) {
      cells.push(contentCell);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document }) {
    const cells = [];
    const floatingCards = Array.from(element.querySelectorAll(".desktopView .floating-card"));
    const valuePillars = Array.from(element.querySelectorAll(".value-pillar-card, .value-pillar"));
    if (floatingCards.length > 0) {
      floatingCards.forEach((card) => {
        const img = card.querySelector(".titleCards-icon img");
        const title = card.querySelector(".titleCards");
        const desc = card.querySelector(".descCards");
        const link = card.querySelector(".floatingcardLinks");
        const imageCell = [];
        if (img) {
          imageCell.push(img);
        }
        const contentCell = [];
        if (title) {
          const strong = document.createElement("strong");
          strong.textContent = title.textContent.trim();
          const p = document.createElement("p");
          p.appendChild(strong);
          contentCell.push(p);
        }
        if (desc) contentCell.push(desc);
        if (link) contentCell.push(link);
        if (imageCell.length > 0) {
          cells.push([imageCell, contentCell]);
        } else {
          cells.push(contentCell);
        }
      });
    } else if (valuePillars.length > 0) {
      valuePillars.forEach((card) => {
        const icon = card.querySelector("img");
        const title = card.querySelector('h3, h4, .value-pillar-title, [class*="title"]');
        const desc = card.querySelector('p, .value-pillar-description, [class*="description"]');
        const imageCell = [];
        if (icon) imageCell.push(icon);
        const contentCell = [];
        if (title) contentCell.push(title);
        if (desc) contentCell.push(desc);
        if (imageCell.length > 0) {
          cells.push([imageCell, contentCell]);
        } else {
          cells.push(contentCell);
        }
      });
    } else {
      const cardItems = Array.from(
        element.querySelectorAll('.cards-alignment, [class*="card"]')
      );
      cardItems.forEach((card) => {
        const img = card.querySelector("img");
        const title = card.querySelector('h2, h3, h4, strong, .titleCards, [class*="title"]');
        const desc = card.querySelector('p, .descCards, [class*="desc"]');
        const link = card.querySelector("a");
        const imageCell = [];
        if (img) imageCell.push(img);
        const contentCell = [];
        if (title) contentCell.push(title);
        if (desc && desc !== title) contentCell.push(desc);
        if (link && link !== title) contentCell.push(link);
        if (imageCell.length > 0 && contentCell.length > 0) {
          cells.push([imageCell, contentCell]);
        } else if (contentCell.length > 0) {
          cells.push(contentCell);
        }
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs.js
  function parse3(element, { document }) {
    const cells = [];
    const tabButtons = Array.from(element.querySelectorAll('[role="tab"], .dds__tabs__tab'));
    const tabPanes = Array.from(element.querySelectorAll('[role="tabpanel"], .dds__tabs__pane'));
    if (tabButtons.length > 0 && tabPanes.length > 0) {
      tabButtons.forEach((tab, index) => {
        const label = tab.textContent.trim();
        const pane = tabPanes[index];
        if (label && pane) {
          cells.push([label, pane]);
        }
      });
    } else {
      const tabItems = Array.from(element.querySelectorAll(".dds__tabs__tab"));
      const paneItems = Array.from(element.querySelectorAll(".dds__tabs__pane"));
      if (tabItems.length > 0) {
        tabItems.forEach((tab, index) => {
          const label = tab.textContent.trim();
          const pane = paneItems[index];
          if (label && pane) {
            cells.push([label, pane]);
          }
        });
      }
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel.js
  function parse4(element, { document }) {
    const cells = [];
    const slides = Array.from(element.querySelectorAll(".dds__carousel__item"));
    slides.forEach((slide) => {
      const img = slide.querySelector(".ai-infrastructure-carousel-img, img");
      const imageCell = [];
      if (img) imageCell.push(img);
      const contentCell = [];
      const heading = slide.querySelector('h2, h3, [class*="h2"]');
      if (heading) contentCell.push(heading);
      const desc = slide.querySelector(".dds__body-2, p");
      if (desc) contentCell.push(desc);
      const ctaLinks = Array.from(slide.querySelectorAll(".cta-link a, .ai-infra-link"));
      ctaLinks.forEach((link) => contentCell.push(link));
      if (imageCell.length > 0 || contentCell.length > 0) {
        cells.push([imageCell, contentCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion.js
  function parse5(element, { document }) {
    const cells = [];
    const faqItems = Array.from(element.querySelectorAll("details.faq-item, .faq-item"));
    if (faqItems.length > 0) {
      faqItems.forEach((item) => {
        const questionEl = item.querySelector(".faq-question, summary p, summary");
        const answerEl = item.querySelector(".faq-answer, .faq-answer-container");
        const questionText = questionEl ? questionEl.textContent.trim() : "";
        const answerContent = answerEl || "";
        if (questionText) {
          cells.push([questionText, answerContent]);
        }
      });
    } else {
      const items = Array.from(element.querySelectorAll('[class*="accordion-item"], details'));
      items.forEach((item) => {
        const title = item.querySelector('summary, [class*="title"], [class*="header"], h3, h4');
        const content = item.querySelector('[class*="content"], [class*="body"], [class*="answer"]');
        if (title && content) {
          cells.push([title.textContent.trim(), content]);
        }
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/dell-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#ucTarget",
        ".shop-ai-chat-wrapper",
        "#uc-panel",
        "#uc-floating-button",
        "#dell-global-mbox",
        ".tnt-html"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Breadcrumbs and partner banners
        "#aibreadcrumb",
        ".ai-breadcrumb-box",
        ".ai-breadcrumbs-container",
        ".cf-partner-section",
        // Footer
        "footer",
        // iframes, links, noscript, scripts
        "iframe",
        "link",
        "noscript",
        "script",
        // SVG icon defs (non-authorable)
        'svg[style*="position: absolute"][aria-hidden="true"]',
        // FAQ controls (expand/collapse all buttons - not authorable)
        ".faq-controls",
        // FAQ SVG icons
        ".faq-icon"
      ]);
    }
  }

  // tools/importer/transformers/dell-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const document = element.ownerDocument;
      const template = payload.template;
      if (!template || !template.sections || template.sections.length < 2) return;
      const sections = template.sections;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const selector = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selector) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-ai-solutions-page.js
  var parsers = {
    "hero": parse,
    "cards": parse2,
    "tabs": parse3,
    "carousel": parse4,
    "accordion": parse5
  };
  var PAGE_TEMPLATE = {
    name: "ai-solutions-page",
    urls: [
      "https://www.dell.com/en-us/shop/scc/sc/artificial-intelligence"
    ],
    description: "Dell AI solutions category page showcasing artificial intelligence products and services",
    blocks: [
      {
        name: "hero",
        instances: ["#hero-ai", ".live-optics-section"]
      },
      {
        name: "cards",
        instances: ["#floating-cards.theme-cards-banner-dark", "#floating-cards.theme-cards-banner-light", ".value-pillars-container"]
      },
      {
        name: "tabs",
        instances: ["#ai-customer-story-tabs", "#ai-ecosystem-tabs-container", "#cpMFE-Tab"]
      },
      {
        name: "carousel",
        instances: ["#ai-infrastructure-carousel"]
      },
      {
        name: "accordion",
        instances: ["#accordion-FAQ"]
      }
    ],
    sections: [
      { id: "section-hero", name: "Hero", selector: ".ai-hero-container", style: "dark", blocks: ["hero"], defaultContent: [] },
      { id: "section-outcomes", name: "Customer Outcomes", selector: "#ai-outcomes", style: "dark", blocks: ["cards"], defaultContent: [".outcomes-header"] },
      { id: "section-customer-stories", name: "AI Use Cases", selector: "#ai-customerstory", style: null, blocks: ["tabs"], defaultContent: [".customerstory-header"] },
      { id: "section-ai-factory", name: "Dell AI Factory", selector: "#ai-factory-dell", style: null, blocks: [], defaultContent: [".ai-factory-header-wrapper", ".ai-factory-content-wrapper", ".ai-factory-animation-wrapper", ".ai-factory-button-wrapper"] },
      { id: "section-live-optics", name: "AI Solutions Explorer CTA", selector: "#ai-liveOptics", style: "accent", blocks: ["hero"], defaultContent: [] },
      { id: "section-data-ai", name: "Data for AI", selector: "#ai-data", style: null, blocks: ["cards"], defaultContent: ["#ai-data > .outcomes-header"] },
      { id: "section-infrastructure", name: "AI Infrastructure", selector: "#ai-infrastructure", style: null, blocks: ["carousel"], defaultContent: [] },
      { id: "section-ecosystem", name: "AI Partner Ecosystem", selector: "#ai-ecosystem", style: null, blocks: ["tabs"], defaultContent: [".ai-ecosystem-row"] },
      { id: "section-services", name: "Professional Services", selector: ".vpmfe-container", style: "light", blocks: ["cards"], defaultContent: [".vpmfe-header-container"] },
      { id: "section-resources", name: "AI Resources", selector: "#cpMFE-Tab", style: null, blocks: ["tabs"], defaultContent: [".cpmfe-title"] },
      { id: "section-faqs", name: "FAQs", selector: ".disclaimerFAQcontainer", style: null, blocks: ["accordion"], defaultContent: [] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_ai_solutions_page_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_ai_solutions_page_exports);
})();
