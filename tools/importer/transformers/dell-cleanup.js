/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Dell site cleanup.
 * Removes non-authorable content from Dell.com pages.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  const { document } = payload;

  if (hookName === TransformHook.beforeTransform) {
    // --- Pre-extract hero background assets before cleanup removes them ---
    // Cleanup later removes <style> blocks and Video.js elements, so we must
    // capture background images and video posters NOW and inject clean elements
    // that the hero parser can pick up (Pattern A: <video poster="...">).
    const heroBlockDefs = (payload.template?.blocks || []).filter((b) => b.name === 'hero');
    const heroSelectors = heroBlockDefs.flatMap((def) => def.instances || []);
    if (heroSelectors.length) {
      heroSelectors.forEach((sel) => {
        const heroEls = element.querySelectorAll(sel);
        heroEls.forEach((heroEl) => {
          // 1. CSS background-image from ancestor cp-container <style> blocks
          let ancestor = heroEl.parentElement;
          while (ancestor && ancestor !== element) {
            if (ancestor.classList && ancestor.classList.contains('cp-container')) {
              let bgUrl = '';
              let bgWidth = 0;
              ancestor.querySelectorAll('style').forEach((s) => {
                const matches = [...s.textContent.matchAll(/min-width:\s*(\d+)px[^}]*background-image:\s*url\("([^"]+)"\)/gs)];
                matches.forEach((m) => {
                  const mw = parseInt(m[1], 10);
                  if (mw >= bgWidth) { bgWidth = mw; bgUrl = m[2]; }
                });
                if (!bgUrl) {
                  const fallback = s.textContent.match(/background-image:\s*url\("([^"]+)"\)/);
                  if (fallback) bgUrl = fallback[1];
                }
              });
              if (bgUrl && !heroEl.querySelector('video:not(.vjs-tech)')) {
                const v = document.createElement('video');
                v.setAttribute('poster', bgUrl.startsWith('//') ? `https:${bgUrl}` : bgUrl);
                heroEl.prepend(v);
              }
              break;
            }
            ancestor = ancestor.parentElement;
          }

          // 2. Preserve video poster from Video.js players before vjs cleanup
          const vjsVideo = heroEl.querySelector('video.vjs-tech[poster], video-js video[poster]');
          if (vjsVideo) {
            const poster = vjsVideo.getAttribute('poster');
            if (poster && !heroEl.querySelector('video:not(.vjs-tech)')) {
              const v = document.createElement('video');
              v.setAttribute('poster', poster.startsWith('//') ? `https:${poster}` : poster);
              heroEl.prepend(v);
            }
          }

          // 3. Promote first H2/H3 to H1 (hero should always have an H1)
          if (!heroEl.querySelector('h1')) {
            const heading = heroEl.querySelector('h2, h3');
            if (heading) {
              const h1 = document.createElement('h1');
              h1.innerHTML = heading.innerHTML;
              if (heading.id) h1.id = heading.id;
              heading.replaceWith(h1);
            }
          }

          // 4. Wrap loose text+inline content in description divs into a <p>
          //    Prevents WebImporter from splitting "Intel Inside<sup>®</sup>." into
          //    separate paragraphs during HTML serialization
          const desc = heroEl.querySelector('.rwp-contentlayout-item__description, .dds_Hero-ai-content');
          if (desc && !desc.querySelector('p')) {
            const p = document.createElement('p');
            while (desc.firstChild) {
              p.appendChild(desc.firstChild);
            }
            desc.appendChild(p);
          }
        });
      });
    }

    // --- Pre-extract showcase background images before cleanup removes <style> ---
    // PLX showcase sections use Brightcove videos with poster images;
    // preserve the poster/fallback images before Video.js cleanup removes them.
    element.querySelectorAll('.plx-showcase-container').forEach((sc) => {
      const vjsVideo = sc.querySelector('video.vjs-tech[poster], video-js video[poster]');
      if (vjsVideo) {
        const poster = vjsVideo.getAttribute('poster');
        if (poster) {
          const img = document.createElement('img');
          img.src = poster.startsWith('//') ? `https:${poster}` : poster;
          img.alt = '';
          img.classList.add('showcase-bg-img');
          const mediaDiv = sc.querySelector('.plx-showcase__media');
          if (mediaDiv) {
            mediaDiv.innerHTML = '';
            mediaDiv.appendChild(img);
          } else {
            sc.prepend(img);
          }
        }
      }
      // Fallback: use the existing <img> in the showcase if no video poster
      if (!sc.querySelector('.showcase-bg-img')) {
        const fallbackImg = sc.querySelector('img');
        if (fallbackImg) fallbackImg.classList.add('showcase-bg-img');
      }
    });

    // --- Pre-extract product-info background images from inline <style> blocks ---
    element.querySelectorAll('.plx-product-media-container').forEach((mc) => {
      const id = mc.id;
      if (!id) return;
      const parent = mc.closest('#plx-product-info') || element;
      parent.querySelectorAll('style').forEach((s) => {
        const re = new RegExp(`#${id}\\s*\\{[^}]*background-image:\\s*url\\(([^)]+)\\)`, 'g');
        let bestUrl = '';
        let bestWidth = 0;
        const matches = [...s.textContent.matchAll(/min-width:\s*(\d+)px[^}]*background-image:\s*url\(([^)]+)\)/gs)];
        matches.forEach((m) => {
          if (m[0].includes(id)) {
            const w = parseInt(m[1], 10);
            if (w >= bestWidth) { bestWidth = w; bestUrl = m[2].replace(/['"]/g, ''); }
          }
        });
        if (!bestUrl) {
          const fallback = s.textContent.match(new RegExp(`#${id}[^}]*background-image:\\s*url\\(["']?([^"')]+)["']?\\)`));
          if (fallback) bestUrl = fallback[1];
        }
        if (bestUrl) {
          const img = document.createElement('img');
          img.src = bestUrl.startsWith('//') ? `https:${bestUrl}` : bestUrl;
          img.alt = '';
          img.classList.add('product-info-bg-img');
          mc.innerHTML = '';
          mc.appendChild(img);
        }
      });
    });

    // Remove PLX navigation tab bar (non-authorable UI chrome) but keep content sections
    element.querySelectorAll('.plx-nav-container').forEach((nav) => nav.remove());

    // Remove site-wide header/navigation chrome
    WebImporter.DOMUtils.remove(element, [
      'header',
      '#unified-masthead',
    ]);

    // Remove chat widgets, virtual assistant, contact panel
    WebImporter.DOMUtils.remove(element, [
      '#ucTarget',
      '.shop-ai-chat-wrapper',
      '#uc-panel',
      '#uc-floating-button',
      '#dell-global-mbox',
      '.tnt-html',
    ]);

    // Remove OneTrust cookie consent SDK (banner, preference center, overlay)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-pc-sdk',
      '#onetrust-banner-sdk',
      '.onetrust-pc-dark-filter',
      '#ot-sdk-cookie-policy',
    ]);

    // Remove Compare Products drawer widget
    WebImporter.DOMUtils.remove(element, [
      '.cf-compare-drawer-wrap',
      '.cd-compare-drawer-wrap',
    ]);

    // Remove Brightcove / Video.js player UI chrome
    // These render as text content (play/pause/skip/captions/quality) in the imported HTML
    WebImporter.DOMUtils.remove(element, [
      '.vjs-control-bar',
      '.vjs-modal-dialog',
      '.vjs-loading-spinner',
      '.vjs-big-play-button',
      '.vjs-text-track-display',
      '.vjs-title-bar',
      '.vjs-poster',
      '.vjs-tech',
      'video-js',
    ]);

    // Remove tracking pixels and analytics beacons
    WebImporter.DOMUtils.remove(element, [
      'img[alt="dot image pixel"]',
      'img[src*="sp.analytics.yahoo.com"]',
      'img[src*="tvspix.com"]',
      'img[src*="bat.bing.com"]',
      'img[src*="t.co/1/i/adsct"]',
      'img[src*="analytics.twitter.com"]',
      'img[src*="1x1.gif"]',
    ]);

    // Remove pagination UI chrome from carousels/tabs
    const paginationEls = element.querySelectorAll('*');
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

    // Remove blob: URLs (invalid references from original browser session)
    const blobLinks = element.querySelectorAll('a[href^="blob:"]');
    blobLinks.forEach((a) => a.remove());

    // --- Product Listing Page (SCR) cleanup ---
    // Remove dynamic product grid, filters, sorting, pagination
    WebImporter.DOMUtils.remove(element, [
      '#super-cat-main-content',
      '#sr-product-stacks',
      '.anavmfe-container',
      '#plp-filters-container',
      '.plp-sort-bar',
      '.plp-results-header',
      '.plp-product-grid',
      '.plp-pagination',
      '#compare-drawer',
      '.scr-compare-drawer',
    ]);

    // Remove "Sign in to Premier" promotional sidebar
    WebImporter.DOMUtils.remove(element, [
      '.premier-sign-in-container',
      '.plp-premier-banner',
    ]);

    // --- System Category Page cleanup ---
    // Remove merchandising footer disclaimers and partner badges
    WebImporter.DOMUtils.remove(element, [
      '#marketing-campaign-disclaimers',
      '.mh-disclaimers-content',
      '.disclaimers-container',
      '.sys-cat-partner-row',
    ]);

    // --- CP Landing Page cleanup ---
    WebImporter.DOMUtils.remove(element, [
      '.cp-page-footer',
      '.cp-page-breadcrumbs',
      '.cp-sticky-nav',
      'img[src*="loading.gif"]',
    ]);

    // --- AIPC / Consumer PC Landing Page cleanup ---
    // VOCAAS survey widget, inline ad-hoc style blocks, contact banner (non-authorable)
    WebImporter.DOMUtils.remove(element, [
      'section[data-iid="vocaas"]',
      '#vocaas',
      '.voc_stm_container',
      'section[data-iid="site-banner-contact-sales"]',
      'section[data-iid="aipc-adhoc"]',
    ]);
    // Remove inline <style> blocks that leak into content
    element.querySelectorAll('style').forEach((el) => el.remove());

    // Remove tracking pixel images (broader patterns for Batch 3 pages)
    WebImporter.DOMUtils.remove(element, [
      'img[src*="t.co/i/adsct"]',
      'img[src*="ads.linkedin.com"]',
      'img[src*="facebook.com/tr"]',
      'img[src*="everesttech.net"]',
      'img[alt="Loading MFE"]',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site chrome
    WebImporter.DOMUtils.remove(element, [
      // Breadcrumbs and partner banners (AI page)
      '#aibreadcrumb',
      '.ai-breadcrumb-box',
      '.ai-breadcrumbs-container',
      '.cf-partner-section',
      // Breadcrumbs (customer story pages)
      '.cp-breadcrumbs',
      // Screen-reader only page title (customer story pages - content has own headings)
      'h1.sr-only',
      // Footer
      'footer',
      // iframes, links, noscript, scripts
      'iframe',
      'link',
      'noscript',
      'script',
      // SVG icon defs (non-authorable)
      'svg[style*="position: absolute"][aria-hidden="true"]',
      // FAQ controls (expand/collapse all buttons - not authorable)
      '.faq-controls',
      '.faq-icon',
      // Carousel navigation controls (non-authorable UI chrome)
      '.rwp-ic-controls-container',
      '.rwp-ic-itemcount-container',
      // Video play button overlays (non-authorable UI)
      'button.rwp-play-button',
      'div.rwp-play-button',
      '.sr-only[id^="description-"]',
    ]);
  }
}
