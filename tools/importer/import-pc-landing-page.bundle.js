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

  // tools/importer/import-pc-landing-page.js
  var import_pc_landing_page_exports = {};
  __export(import_pc_landing_page_exports, {
    default: () => import_pc_landing_page_default
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
    if (cells.length === 0) {
      let bgUrl = "";
      let bgWidth = 0;
      element.querySelectorAll("style").forEach((s) => {
        const matches = [...s.textContent.matchAll(new RegExp('min-width:\\s*(\\d+)px[^}]*background-image:\\s*url\\("([^"]+)"\\)', "gs"))];
        matches.forEach((m) => {
          const mw = parseInt(m[1], 10);
          if (mw >= bgWidth) {
            bgWidth = mw;
            bgUrl = m[2];
          }
        });
        if (!bgUrl) {
          const fallback = s.textContent.match(/background-image:\s*url\("([^"]+)"\)/);
          if (fallback) bgUrl = fallback[1];
        }
      });
      if (bgUrl) {
        const img = document.createElement("img");
        img.src = bgUrl.startsWith("//") ? `https:${bgUrl}` : bgUrl;
        img.alt = "Hero background";
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
    const heading = element.querySelector("h1, h2, h3, .rwp-contentlayout-item__title");
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
      ".plx-hero__copy, .mh-content-layout-description, .dds_Hero-ai-content, .live-optics-description, .rwp-contentlayout-item__description, p:not(.faq-question)"
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

  // tools/importer/parsers/columns.js
  function parse2(element, { document }) {
    const cells = [];
    const columnItems = Array.from(
      element.querySelectorAll(".rwp-contentlayout-item")
    );
    if (columnItems.length > 0) {
      const row = [];
      columnItems.forEach((col) => {
        const cellContent = [];
        const img = col.querySelector("img.rwp-image, img");
        if (img) {
          const src = img.getAttribute("src") || "";
          const newImg = document.createElement("img");
          newImg.src = src.startsWith("//") ? `https:${src}` : src;
          newImg.alt = img.alt || "";
          cellContent.push(newImg);
        }
        const title = col.querySelector(".rwp-contentlayout-item__title, h3, h2");
        if (title) {
          const h3 = document.createElement("h3");
          h3.textContent = title.textContent.trim();
          cellContent.push(h3);
        }
        const desc = col.querySelector(".rwp-contentlayout-item__description");
        if (desc) {
          const p = document.createElement("p");
          p.innerHTML = desc.innerHTML;
          cellContent.push(p);
        }
        const links = Array.from(col.querySelectorAll(".rwp-button__link, .rwp-webpart__links a"));
        links.forEach((link) => cellContent.push(link));
        row.push(cellContent);
      });
      cells.push(row);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse3(element, { document }) {
    const cells = [];
    const floatingCards = Array.from(element.querySelectorAll(".desktopView .floating-card"));
    const valuePillars = Array.from(element.querySelectorAll(".value-pillar-card, .value-pillar"));
    const contentLayoutItems = Array.from(
      element.querySelectorAll(".rwp-contentlayout-item--columns-Four")
    );
    const carouselSlides = Array.from(element.querySelectorAll(".rwp-ic-slide"));
    const multiColItems = Array.from(
      element.querySelectorAll(".rwp-contentlayout-item--columns-Two, .rwp-contentlayout-item--columns-Three")
    );
    const gridItems = Array.from(element.querySelectorAll(".grid-item"));
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
        const imageCell = [];
        const svgIcon = card.querySelector(".rwp-contentlayout-item__visual-container svg");
        if (svgIcon) {
          const iconName = svgIcon.getAttribute("data-icon-name") || "icon";
          const img = document.createElement("img");
          img.src = `./icons/${iconName}.svg`;
          img.alt = iconName;
          imageCell.push(img);
        } else {
          const img = card.querySelector("img.rwp-image, img");
          if (img) {
            const src = img.getAttribute("src") || "";
            const newImg = document.createElement("img");
            newImg.src = src.startsWith("//") ? `https:${src}` : src;
            newImg.alt = img.alt || "";
            imageCell.push(newImg);
          }
        }
        const contentCell = [];
        const title = card.querySelector(".rwp-contentlayout-item__title, h3, h2");
        if (title) {
          const h3 = document.createElement("h3");
          h3.textContent = title.textContent.trim();
          contentCell.push(h3);
        }
        const desc = card.querySelector(".rwp-contentlayout-item__description");
        if (desc) {
          const p = document.createElement("p");
          p.innerHTML = desc.innerHTML.trim();
          contentCell.push(p);
        }
        const links = Array.from(card.querySelectorAll(".rwp-button__link, .rwp-webpart__links a"));
        links.forEach((link) => {
          const a = document.createElement("a");
          a.href = link.href || "";
          a.textContent = link.textContent.trim();
          contentCell.push(a);
        });
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
    } else if (multiColItems.length > 0) {
      multiColItems.forEach((card) => {
        const imageCell = [];
        const img = card.querySelector("img.rwp-image, img");
        if (img) {
          const src = img.getAttribute("src") || "";
          const newImg = document.createElement("img");
          newImg.src = src.startsWith("//") ? `https:${src}` : src;
          newImg.alt = img.alt || "";
          imageCell.push(newImg);
        }
        const contentCell = [];
        const title = card.querySelector(".rwp-contentlayout-item__title, h3, h2");
        if (title) {
          const h3 = document.createElement("h3");
          h3.textContent = title.textContent.trim();
          contentCell.push(h3);
        }
        const desc = card.querySelector(".rwp-contentlayout-item__description");
        if (desc) {
          const p = document.createElement("p");
          p.innerHTML = desc.innerHTML.trim();
          contentCell.push(p);
        }
        const links = Array.from(card.querySelectorAll(".rwp-button__link, .rwp-webpart__links a"));
        links.forEach((link) => {
          const a = document.createElement("a");
          a.href = link.href || "";
          a.textContent = link.textContent.trim();
          contentCell.push(a);
        });
        if (imageCell.length > 0 && contentCell.length > 0) {
          cells.push([imageCell, contentCell]);
        } else if (contentCell.length > 0) {
          cells.push(contentCell);
        }
      });
    } else if (gridItems.length > 0) {
      gridItems.forEach((item) => {
        const desc = item.querySelector(".description");
        if (!desc) return;
        const contentCell = [];
        const heading = desc.querySelector("h2");
        if (heading) {
          const h3 = document.createElement("h3");
          h3.textContent = heading.textContent.trim();
          contentCell.push(h3);
        }
        const subtitle = desc.querySelector("h3");
        if (subtitle) {
          const p = document.createElement("p");
          p.textContent = subtitle.textContent.trim();
          contentCell.push(p);
        }
        const img = item.querySelector("img");
        const imageCell = [];
        if (img) imageCell.push(img);
        const link = item.querySelector("a");
        if (link) contentCell.push(link);
        if (imageCell.length > 0 && contentCell.length > 0) {
          cells.push([imageCell, contentCell]);
        } else if (contentCell.length > 0) {
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
  function parse4(element, { document }) {
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
      if (items.length > 0) {
        items.forEach((item) => {
          const title = item.querySelector('summary, [class*="title"], [class*="header"], h3, h4');
          const content = item.querySelector('[class*="content"], [class*="body"], [class*="answer"]');
          if (title && content) {
            cells.push([title.textContent.trim(), content]);
          }
        });
      } else {
        const faqButtons = Array.from(element.querySelectorAll('button[id*="button"]'));
        const faqAnswers = Array.from(element.querySelectorAll('div[id*="answer"]'));
        if (faqButtons.length > 0 && faqAnswers.length > 0) {
          faqButtons.forEach((btn, idx) => {
            const questionText = btn.textContent.trim();
            if (!questionText || /^faq/i.test(questionText) || /frequently asked/i.test(questionText)) return;
            const answerEl = faqAnswers[idx];
            if (answerEl) {
              const answerCopy = answerEl.querySelector(".rwp-faq-item__answer--copy") || answerEl;
              cells.push([questionText, answerCopy]);
            }
          });
        } else {
          const headings = Array.from(element.querySelectorAll("h3"));
          headings.forEach((h3) => {
            const questionText = h3.textContent.trim();
            if (!questionText || /^faq/i.test(questionText) || /frequently asked/i.test(questionText)) return;
            const answerParts = [];
            let sibling = h3.nextElementSibling;
            while (sibling && sibling.tagName !== "H3" && sibling.tagName !== "H2") {
              if (sibling.tagName === "P" && sibling.textContent.trim()) {
                answerParts.push(sibling.textContent.trim());
              }
              sibling = sibling.nextElementSibling;
            }
            if (answerParts.length > 0) {
              const answerDiv = document.createElement("div");
              answerParts.forEach((text) => {
                const p = document.createElement("p");
                p.textContent = text;
                answerDiv.appendChild(p);
              });
              cells.push([questionText, answerDiv]);
            }
          });
        }
      }
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/agreements.js
  function parse5(element, { document }) {
    const cells = [];
    const agreements = element.querySelectorAll(".cp-agreements-agreement");
    agreements.forEach((agreement) => {
      var _a, _b;
      const logoDiv = agreement.querySelector(".cp-agreements-logo");
      const descDiv = agreement.querySelector(".cp-agreements-description");
      const row = [];
      if (logoDiv) {
        const link = logoDiv.querySelector("a");
        const img = logoDiv.querySelector("img");
        if (img && link) {
          const a = document.createElement("a");
          a.href = link.href;
          const newImg = document.createElement("img");
          newImg.src = ((_a = img.src) == null ? void 0 : _a.startsWith("//")) ? `https:${img.src}` : img.src;
          newImg.alt = img.alt || "";
          a.appendChild(newImg);
          row.push(a);
        } else if (img) {
          const newImg = document.createElement("img");
          newImg.src = ((_b = img.src) == null ? void 0 : _b.startsWith("//")) ? `https:${img.src}` : img.src;
          newImg.alt = img.alt || "";
          row.push(newImg);
        }
      }
      if (descDiv) {
        const container = document.createElement("div");
        const textDiv = descDiv.querySelector("div");
        const link = descDiv.querySelector("a");
        if (textDiv) {
          const p = document.createElement("p");
          p.textContent = textDiv.textContent.trim();
          container.appendChild(p);
        }
        if (link) {
          const a = document.createElement("a");
          a.href = link.href;
          a.textContent = link.textContent.trim();
          container.appendChild(a);
        }
        if (container.children.length) row.push(container);
      }
      if (row.length > 0) cells.push(row);
    });
    if (cells.length > 0) {
      const block = WebImporter.Blocks.createBlock(document, { name: "agreements", cells });
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/showcase.js
  function parse6(element, { document }) {
    const cells = [];
    const bgImg = element.querySelector(".showcase-bg-img, .plx-showcase__media img");
    if (bgImg) {
      const img = document.createElement("img");
      const src = bgImg.src || bgImg.getAttribute("src") || "";
      img.src = src.startsWith("//") ? `https:${src}` : src;
      img.alt = bgImg.alt || "";
      cells.push([img]);
    }
    const contentCell = [];
    const heading = element.querySelector("h2");
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = heading.textContent.trim();
      contentCell.push(h2);
    }
    const descEl = element.querySelector(".plx-showcase__description, .plx-showcase-container > p");
    if (descEl) {
      const p = document.createElement("p");
      p.textContent = descEl.textContent.trim();
      contentCell.push(p);
    }
    const ctaLink = element.querySelector("a[href]:not(.plx-nav-anchor)");
    if (ctaLink && ctaLink.textContent.trim().length > 0) {
      const a = document.createElement("a");
      a.href = ctaLink.href;
      a.textContent = ctaLink.textContent.trim();
      const p = document.createElement("p");
      p.appendChild(a);
      contentCell.push(p);
    }
    if (contentCell.length > 0) cells.push(contentCell);
    if (cells.length > 0) {
      const block = WebImporter.Blocks.createBlock(document, { name: "showcase", cells });
      element.replaceWith(block);
    }
  }

  // tools/importer/transformers/dell-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    var _a;
    const { document } = payload;
    if (hookName === TransformHook.beforeTransform) {
      const heroBlockDefs = (((_a = payload.template) == null ? void 0 : _a.blocks) || []).filter((b) => b.name === "hero");
      const heroSelectors = heroBlockDefs.flatMap((def) => def.instances || []);
      if (heroSelectors.length) {
        heroSelectors.forEach((sel) => {
          const heroEls = element.querySelectorAll(sel);
          heroEls.forEach((heroEl) => {
            let ancestor = heroEl.parentElement;
            while (ancestor && ancestor !== element) {
              if (ancestor.classList && ancestor.classList.contains("cp-container")) {
                let bgUrl = "";
                let bgWidth = 0;
                ancestor.querySelectorAll("style").forEach((s) => {
                  const matches = [...s.textContent.matchAll(new RegExp('min-width:\\s*(\\d+)px[^}]*background-image:\\s*url\\("([^"]+)"\\)', "gs"))];
                  matches.forEach((m) => {
                    const mw = parseInt(m[1], 10);
                    if (mw >= bgWidth) {
                      bgWidth = mw;
                      bgUrl = m[2];
                    }
                  });
                  if (!bgUrl) {
                    const fallback = s.textContent.match(/background-image:\s*url\("([^"]+)"\)/);
                    if (fallback) bgUrl = fallback[1];
                  }
                });
                if (bgUrl && !heroEl.querySelector("video:not(.vjs-tech)")) {
                  const v = document.createElement("video");
                  v.setAttribute("poster", bgUrl.startsWith("//") ? `https:${bgUrl}` : bgUrl);
                  heroEl.prepend(v);
                }
                break;
              }
              ancestor = ancestor.parentElement;
            }
            const vjsVideo = heroEl.querySelector("video.vjs-tech[poster], video-js video[poster]");
            if (vjsVideo) {
              const poster = vjsVideo.getAttribute("poster");
              if (poster && !heroEl.querySelector("video:not(.vjs-tech)")) {
                const v = document.createElement("video");
                v.setAttribute("poster", poster.startsWith("//") ? `https:${poster}` : poster);
                heroEl.prepend(v);
              }
            }
            if (!heroEl.querySelector("h1")) {
              const heading = heroEl.querySelector("h2, h3");
              if (heading) {
                const h1 = document.createElement("h1");
                h1.innerHTML = heading.innerHTML;
                if (heading.id) h1.id = heading.id;
                heading.replaceWith(h1);
              }
            }
            const desc = heroEl.querySelector(".rwp-contentlayout-item__description, .dds_Hero-ai-content");
            if (desc && !desc.querySelector("p")) {
              const p = document.createElement("p");
              while (desc.firstChild) {
                p.appendChild(desc.firstChild);
              }
              desc.appendChild(p);
            }
          });
        });
      }
      element.querySelectorAll(".plx-showcase-container").forEach((sc) => {
        const vjsVideo = sc.querySelector("video.vjs-tech[poster], video-js video[poster]");
        if (vjsVideo) {
          const poster = vjsVideo.getAttribute("poster");
          if (poster) {
            const img = document.createElement("img");
            img.src = poster.startsWith("//") ? `https:${poster}` : poster;
            img.alt = "";
            img.classList.add("showcase-bg-img");
            const mediaDiv = sc.querySelector(".plx-showcase__media");
            if (mediaDiv) {
              mediaDiv.innerHTML = "";
              mediaDiv.appendChild(img);
            } else {
              sc.prepend(img);
            }
          }
        }
        if (!sc.querySelector(".showcase-bg-img")) {
          const fallbackImg = sc.querySelector("img");
          if (fallbackImg) fallbackImg.classList.add("showcase-bg-img");
        }
      });
      element.querySelectorAll(".plx-product-media-container").forEach((mc) => {
        const id = mc.id;
        if (!id) return;
        const parent = mc.closest("#plx-product-info") || element;
        parent.querySelectorAll("style").forEach((s) => {
          const re = new RegExp(`#${id}\\s*\\{[^}]*background-image:\\s*url\\(([^)]+)\\)`, "g");
          let bestUrl = "";
          let bestWidth = 0;
          const matches = [...s.textContent.matchAll(new RegExp("min-width:\\s*(\\d+)px[^}]*background-image:\\s*url\\(([^)]+)\\)", "gs"))];
          matches.forEach((m) => {
            if (m[0].includes(id)) {
              const w = parseInt(m[1], 10);
              if (w >= bestWidth) {
                bestWidth = w;
                bestUrl = m[2].replace(/['"]/g, "");
              }
            }
          });
          if (!bestUrl) {
            const fallback = s.textContent.match(new RegExp(`#${id}[^}]*background-image:\\s*url\\(["']?([^"')]+)["']?\\)`));
            if (fallback) bestUrl = fallback[1];
          }
          if (bestUrl) {
            const img = document.createElement("img");
            img.src = bestUrl.startsWith("//") ? `https:${bestUrl}` : bestUrl;
            img.alt = "";
            img.classList.add("product-info-bg-img");
            mc.innerHTML = "";
            mc.appendChild(img);
          }
        });
      });
      element.querySelectorAll(".plx-nav-container").forEach((nav) => nav.remove());
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
        ".tnt-html"
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
        'section[data-iid="vocaas"]',
        "#vocaas",
        ".voc_stm_container",
        'section[data-iid="site-banner-contact-sales"]',
        'section[data-iid="aipc-adhoc"]'
      ]);
      element.querySelectorAll("style").forEach((el) => el.remove());
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

  // tools/importer/import-pc-landing-page.js
  var parsers = {
    "hero": parse,
    "columns": parse2,
    "cards": parse3,
    "accordion": parse4,
    "agreements": parse5,
    "showcase": parse6
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "pc-landing-page",
    description: "Consumer PC product landing page with hero, feature highlights, product cards, comparison sections, and dark CTA banners",
    urls: [
      "https://www.dell.com/en-us/lp/aipc",
      "https://www.dell.com/en-us/lp/dell-pro-max-pcs"
    ],
    blocks: [
      {
        name: "agreements",
        instances: [
          // Both pages: partner agreement badges (Windows 11, Intel Core)
          ".cp-agreements-container"
        ]
      },
      {
        name: "hero",
        instances: [
          // AIPC: traditional rwp-webpart hero
          "section[data-iid*='wp1']"
        ]
      },
      {
        name: "hero",
        variant: "center, full",
        instances: [
          // Pro Max: TailoredTemplatesMfe containing hero with H1 + video
          "section.rwp-webpart-TailoredTemplatesMfe[data-iid*='product-line-experience']"
        ]
      },
      {
        name: "showcase",
        instances: [
          // Pro Max: PLX showcase sections (Extraordinary performance, etc.)
          ".plx-showcase-container"
        ],
        section: "navy-blue"
      },
      {
        name: "columns",
        instances: [
          // AIPC: feature highlight columns
          "section[data-iid='aipc-wp2']",
          // Pro Max: AI development content layout
          "section.rwp-webpart-ContentLayout[data-iid*='ai-dev']",
          // Pro Max: eGuides/Brochures content layout
          "section.rwp-webpart-ContentLayout[data-iid*='content-layout']"
        ],
        section: "navy-blue"
      },
      {
        name: "cards",
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
          "section.rwp-webpart-TailoredTemplatesMfe[data-iid*='product-navigation']"
        ],
        section: "navy-blue"
      },
      {
        name: "accordion",
        instances: [
          // Both pages: FAQ sections (broadened selector)
          ".rwp-webpart-FAQ[data-iid*='faq']"
        ],
        section: "navy-blue"
      }
    ],
    sections: [
      {
        id: "section-hero",
        name: "Hero Section",
        selector: "div[id*='aipc-wp1-item-jan6-wp1'].cp-container",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-feature",
        name: "Feature Highlight",
        selector: "div[id*='aipc-wp2'].cp-container",
        style: "navy-blue",
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-use-cases",
        name: "Use Cases Cards",
        selector: "div[id*='aipc-wp3'].cp-container",
        style: "navy-blue",
        blocks: ["cards"],
        defaultContent: []
      },
      {
        id: "section-products",
        name: "Product Portfolio",
        selector: "div[id*='aipc-wp4'].cp-container",
        style: "navy-blue",
        blocks: ["cards"],
        defaultContent: ["h2"]
      },
      {
        id: "section-meet-family",
        name: "Meet the Family",
        selector: "div[id*='aipc-wp5'].cp-container",
        style: "navy-blue",
        blocks: [],
        defaultContent: ["h2", "p", "a"]
      },
      {
        id: "section-benefits",
        name: "Benefits Videos",
        selector: "div[id*='aipc-wp11'].cp-container",
        style: "navy-blue",
        blocks: ["cards"],
        defaultContent: ["h2"]
      },
      {
        id: "section-resources",
        name: "Resource Cards",
        selector: "div[id*='aipc-wp8'].cp-container",
        style: "navy-blue",
        blocks: ["cards"],
        defaultContent: []
      },
      {
        id: "section-faq",
        name: "FAQ",
        selector: "div[id*='aipc-faq'].cp-container",
        style: "navy-blue",
        blocks: ["accordion"],
        defaultContent: ["h2"]
      },
      {
        id: "section-disclaimers",
        name: "Disclaimers",
        selector: "div[id*='aipc-wp10'].cp-container",
        style: "quartz-gray",
        blocks: [],
        defaultContent: ["p"]
      }
    ]
  };
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
            variant: blockDef.variant || null,
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
  var import_pc_landing_page_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            const marker = document.createComment("block-marker");
            block.element.parentNode.insertBefore(marker, block.element);
            parser(block.element, { document, url, params });
            if (block.variant) {
              let node = marker.nextSibling;
              while (node && node.nodeType !== 1) node = node.nextSibling;
              if (node && node.tagName === "TABLE") {
                const th = node.querySelector("th");
                if (th) {
                  const blockName = th.textContent.trim();
                  const expected = block.name.replace(/-/g, " ").replace(/\s(.)/g, (m) => m.toUpperCase()).replace(/^(.)/, (m) => m.toUpperCase());
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
  return __toCommonJS(import_pc_landing_page_exports);
})();
