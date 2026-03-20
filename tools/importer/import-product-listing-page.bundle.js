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

  // tools/importer/import-product-listing-page.js
  var import_product_listing_page_exports = {};
  __export(import_product_listing_page_exports, {
    default: () => import_product_listing_page_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const cells = [];
    const video = element.querySelector("video");
    const bgVideo = element.querySelector("bgvideo[data-video-id]");
    const bgImg = element.querySelector(".live-optics-img-banner, img.live-optics-img-banner");
    if (video) {
      const posterUrl = video.getAttribute("poster");
      if (posterUrl) {
        const img = document.createElement("img");
        img.src = posterUrl.startsWith("//") ? `https:${posterUrl}` : posterUrl;
        img.alt = "Hero background";
        cells.push([img]);
      }
    } else if (bgVideo) {
      const heroImage = element.querySelector(".rwp-contentlayout-item__visual-container img.rwp-image");
      if (heroImage) {
        const src = heroImage.getAttribute("src") || "";
        const img = document.createElement("img");
        img.src = src.startsWith("//") ? `https:${src}` : src;
        img.alt = heroImage.alt || "Hero background";
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
    const eyebrow = element.querySelector(".rwp-webpart__eyebrowHeader-container_text");
    if (eyebrow) {
      const p = document.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      contentCell.push(p);
    }
    const heading = element.querySelector("h1, h2, .rwp-contentlayout-item__title");
    if (heading) {
      if (heading.tagName === "SPAN") {
        const h1 = document.createElement("h1");
        h1.textContent = heading.textContent.trim();
        contentCell.push(h1);
      } else {
        contentCell.push(heading);
      }
    }
    const desc = element.querySelector(
      ".dds_Hero-ai-content, .live-optics-description, .rwp-contentlayout-item__description, p:not(.faq-question)"
    );
    if (desc && desc !== heading) contentCell.push(desc);
    const ctaLinks = Array.from(
      element.querySelectorAll(
        ".ai-uc-hero-btn, .live-optics-button, a.dds__button, a.live-optics-button, .rwp-button__link"
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
    const contentLayoutItems = Array.from(
      element.querySelectorAll(".rwp-contentlayout-item--columns-Four")
    );
    const carouselSlides = Array.from(element.querySelectorAll(".rwp-ic-slide"));
    if (floatingCards.length > 0) {
      floatingCards.forEach((card) => {
        const img = card.querySelector(".titleCards-icon img");
        const title = card.querySelector(".titleCards");
        const desc = card.querySelector(".descCards");
        const link = card.querySelector(".floatingcardLinks");
        const imageCell = [];
        if (img) imageCell.push(img);
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
    } else if (contentLayoutItems.length > 0) {
      contentLayoutItems.forEach((card) => {
        const svgIcon = card.querySelector(".rwp-contentlayout-item__visual-container svg");
        const desc = card.querySelector(".rwp-contentlayout-item__description");
        const imageCell = [];
        if (svgIcon) {
          const iconName = svgIcon.getAttribute("data-icon-name") || "icon";
          const img = document.createElement("img");
          img.src = `./icons/${iconName}.svg`;
          img.alt = iconName;
          imageCell.push(img);
        }
        const contentCell = [];
        if (desc) {
          const p = document.createElement("p");
          p.innerHTML = desc.innerHTML.trim();
          contentCell.push(p);
        }
        if (imageCell.length > 0 && contentCell.length > 0) {
          cells.push([imageCell, contentCell]);
        } else if (contentCell.length > 0) {
          cells.push(contentCell);
        }
      });
    } else if (carouselSlides.length > 0) {
      carouselSlides.forEach((slide) => {
        const title = slide.querySelector(".rwp-ic-slide__title, h3, h2");
        const desc = slide.querySelector(".rwp-ic-slide__description");
        const ctaLink = slide.querySelector(".rwp-button__link, .rwp-webpart__links a");
        const contentCell = [];
        if (title) {
          const strong = document.createElement("strong");
          strong.textContent = title.textContent.trim();
          const p = document.createElement("p");
          p.appendChild(strong);
          contentCell.push(p);
        }
        if (desc) {
          const p = document.createElement("p");
          p.textContent = desc.textContent.trim();
          contentCell.push(p);
        }
        if (ctaLink) contentCell.push(ctaLink);
        if (contentCell.length > 0) {
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

  // tools/importer/parsers/accordion.js
  function parse3(element, { document }) {
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
    const { document } = payload;
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "#unified-masthead"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#ucTarget",
        ".shop-ai-chat-wrapper",
        "#uc-panel",
        "#uc-floating-button",
        "#dell-global-mbox",
        ".tnt-html",
        ".cp-agreements-container"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#onetrust-pc-sdk",
        "#onetrust-banner-sdk",
        ".onetrust-pc-dark-filter",
        "#ot-sdk-cookie-policy"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".cf-compare-drawer-wrap",
        ".cd-compare-drawer-wrap"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".vjs-control-bar",
        ".vjs-modal-dialog",
        ".vjs-loading-spinner",
        ".vjs-big-play-button",
        ".vjs-text-track-display",
        ".vjs-title-bar",
        ".vjs-poster",
        ".vjs-tech",
        "video-js"
      ]);
      WebImporter.DOMUtils.remove(element, [
        'img[alt="dot image pixel"]',
        'img[src*="sp.analytics.yahoo.com"]',
        'img[src*="tvspix.com"]',
        'img[src*="bat.bing.com"]',
        'img[src*="t.co/1/i/adsct"]',
        'img[src*="analytics.twitter.com"]',
        'img[src*="1x1.gif"]'
      ]);
      const paginationEls = element.querySelectorAll("*");
      paginationEls.forEach((el) => {
        if (el.children.length === 0 && /^Showing page \d+ of \d+$/.test(el.textContent.trim())) {
          el.remove();
        }
        if (el.children.length === 0 && /^\d+\/\d+$/.test(el.textContent.trim())) {
          const prev = el.previousElementSibling;
          if (prev && /^Showing page/.test(prev.textContent.trim())) {
            el.remove();
          }
        }
      });
      const blobLinks = element.querySelectorAll('a[href^="blob:"]');
      blobLinks.forEach((a) => a.remove());
      WebImporter.DOMUtils.remove(element, [
        "#super-cat-main-content",
        "#sr-product-stacks",
        ".anavmfe-container",
        "#plp-filters-container",
        ".plp-sort-bar",
        ".plp-results-header",
        ".plp-product-grid",
        ".plp-pagination",
        "#compare-drawer",
        ".scr-compare-drawer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".premier-sign-in-container",
        ".plp-premier-banner"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#marketing-campaign-disclaimers",
        ".mh-disclaimers-content",
        ".disclaimers-container",
        ".sys-cat-partner-row"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".cp-page-footer",
        ".cp-page-breadcrumbs",
        ".cp-sticky-nav",
        'img[src*="loading.gif"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        'img[src*="t.co/i/adsct"]',
        'img[src*="ads.linkedin.com"]',
        'img[src*="facebook.com/tr"]',
        'img[src*="everesttech.net"]',
        'img[alt="Loading MFE"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Breadcrumbs and partner banners (AI page)
        "#aibreadcrumb",
        ".ai-breadcrumb-box",
        ".ai-breadcrumbs-container",
        ".cf-partner-section",
        // Breadcrumbs (customer story pages)
        ".cp-breadcrumbs",
        ".cp-page-top-container",
        // Screen-reader only page title (customer story pages - content has own headings)
        "h1.sr-only",
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
        ".faq-icon",
        // Carousel navigation controls (non-authorable UI chrome)
        ".rwp-ic-controls-container",
        ".rwp-ic-itemcount-container",
        // Video play button overlays (non-authorable UI)
        "button.rwp-play-button",
        "div.rwp-play-button",
        '.sr-only[id^="description-"]'
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

  // tools/importer/import-product-listing-page.js
  var parsers = {
    "hero": parse,
    "cards": parse2,
    "accordion": parse3
  };
  var PAGE_TEMPLATE = {
    name: "product-listing-page",
    description: "Product listing/search results page with hero, showcase banners, and FAQ. Dynamic product grid is excluded.",
    urls: [
      "https://www.dell.com/en-us/shop/scc/sc/laptops",
      "https://www.dell.com/en-us/shop/dell-laptops/scr/laptops",
      "https://www.dell.com/en-us/shop/desktop-computers/scr/desktops"
    ],
    blocks: [
      {
        name: "hero",
        instances: [
          ".tnt-hero-section",
          ".plp-scr-banner"
        ]
      },
      {
        name: "cards",
        instances: [
          "#showcase-banner-main-container"
        ]
      },
      {
        name: "accordion",
        instances: [
          "#scr-faq-content"
        ]
      }
    ],
    sections: [
      {
        id: "section-tnt-hero",
        name: "TNT Video Hero",
        selector: ".tnt-hero-section",
        style: "dark",
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-scr-banner",
        name: "Category Banner",
        selector: ".plp-scr-banner",
        style: "dark",
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-showcase-banner",
        name: "Showcase Banners",
        selector: "#showcase-banner-main-container",
        style: "dark",
        blocks: ["cards"],
        defaultContent: []
      },
      {
        id: "section-faq",
        name: "FAQ",
        selector: "#scr-faq-content",
        style: null,
        blocks: ["accordion"],
        defaultContent: ["#scr-faq-content h2", "#scr-faq-content > .scr-show-more"]
      }
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
  var import_product_listing_page_default = {
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
  return __toCommonJS(import_product_listing_page_exports);
})();
