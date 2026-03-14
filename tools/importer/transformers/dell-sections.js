/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Dell AI page section breaks and section metadata.
 * Adds <hr> section breaks and Section Metadata blocks based on template sections.
 * Runs in afterTransform only, after block parsing.
 * Note: Dell page is JS-rendered; section selectors match the fully-rendered DOM.
 * All selectors from page-templates.json sections (verified from captured DOM).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const document = element.ownerDocument;
    const template = payload.template;
    if (!template || !template.sections || template.sections.length < 2) return;

    const sections = template.sections;

    // Process sections in reverse order to avoid index shifts
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const selector = Array.isArray(section.selector) ? section.selector : [section.selector];

      let sectionEl = null;
      for (const sel of selector) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }

      if (!sectionEl) continue;

      // Add Section Metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Add <hr> before section (except the first section)
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
