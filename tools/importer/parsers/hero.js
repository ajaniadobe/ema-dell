/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero.
 * Base block: hero.
 * Sources:
 *   - https://www.dell.com/en-us/shop/scc/sc/artificial-intelligence
 *     Instances: #hero-ai (main hero with video), .live-optics-section (CTA banner with bg image)
 *   - https://www.dell.com/en-us/lp/dt/customer-stories-mclaren-racing
 *     Instance: cp-container with bgvideo + rwp-contentlayout (logo + eyebrow + heading)
 *   - https://www.dell.com/en-us/lp/aipc
 *     Instance: cp-container with CSS background-image in inline <style> blocks
 *   - https://www.dell.com/en-us/lp/dell-pro-max-pcs
 *     Instance: TailoredTemplatesMfe with .plx-page hero (H1 + video poster + description)
 *
 * Block library structure:
 *   Row 1: Background image or video (optional)
 *   Row 2: Eyebrow + Title + subheading + CTAs
 */
export default function parse(element, { document }) {
  const cells = [];

  // --- Row 1: Background image or video poster ---

  // Pattern A: AI page - <video> with poster attribute
  const video = element.querySelector('video');
  // Pattern B: Customer story - Brightcove bgvideo element with data-video-id
  const bgVideo = element.querySelector('bgvideo[data-video-id]');
  // Pattern C: AI page - live optics background image
  const bgImg = element.querySelector('.live-optics-img-banner, img.live-optics-img-banner');

  if (video) {
    const posterUrl = video.getAttribute('poster');
    if (posterUrl) {
      const img = document.createElement('img');
      img.src = posterUrl.startsWith('//') ? `https:${posterUrl}` : posterUrl;
      img.alt = 'Hero background';
      cells.push([img]);
    }
  } else if (bgVideo) {
    // For Brightcove videos, use the first content image as background fallback
    const heroImage = element.querySelector('.rwp-contentlayout-item__visual-container img.rwp-image');
    if (heroImage) {
      const src = heroImage.getAttribute('src') || '';
      const img = document.createElement('img');
      img.src = src.startsWith('//') ? `https:${src}` : src;
      img.alt = heroImage.alt || 'Hero background';
      cells.push([img]);
    }
  } else if (bgImg) {
    const realSrc = bgImg.getAttribute('data-src') || bgImg.getAttribute('src') || '';
    if (realSrc && !realSrc.startsWith('data:')) {
      const img = document.createElement('img');
      img.src = realSrc.startsWith('//') ? `https:${realSrc}` : realSrc;
      img.alt = bgImg.alt || 'Hero background';
      cells.push([img]);
    }
  }

  // Pattern D: CSS background-image from inline <style> blocks (Dell CP pages)
  if (cells.length === 0) {
    let bgUrl = '';
    let bgWidth = 0;
    element.querySelectorAll('style').forEach((s) => {
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
    if (bgUrl) {
      const img = document.createElement('img');
      img.src = bgUrl.startsWith('//') ? `https:${bgUrl}` : bgUrl;
      img.alt = 'Hero background';
      cells.push([img]);
    }
  }

  // --- Row 2: Heading + description + CTAs ---
  const contentCell = [];

  // Customer story eyebrow text (e.g., "CUSTOMER STORIES")
  const eyebrow = element.querySelector('.rwp-webpart__eyebrowHeader-container_text');
  if (eyebrow) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    contentCell.push(p);
  }

  // Heading: h1, h2, h3, or rwp-contentlayout title span
  const heading = element.querySelector('h1, h2, h3, .rwp-contentlayout-item__title');
  if (heading) {
    // Wrap in h1 for hero block if it's a span
    if (heading.tagName === 'SPAN') {
      const h1 = document.createElement('h1');
      h1.textContent = heading.textContent.trim();
      contentCell.push(h1);
    } else {
      contentCell.push(heading);
    }
  }

  // Description / subtitle
  const desc = element.querySelector(
    '.plx-hero__copy, .mh-content-layout-description, .dds_Hero-ai-content, .live-optics-description, .rwp-contentlayout-item__description, p:not(.faq-question)'
  );
  if (desc && desc !== heading) contentCell.push(desc);

  // CTA links
  const ctaLinks = Array.from(
    element.querySelectorAll(
      '.ai-uc-hero-btn, .live-optics-button, a.dds__button, a.live-optics-button, .rwp-button__link'
    )
  );
  ctaLinks.forEach((link) => contentCell.push(link));

  if (contentCell.length > 0) {
    cells.push(contentCell);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
