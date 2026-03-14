/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion.
 * Base block: accordion.
 * Source: https://www.dell.com/en-us/shop/scc/sc/artificial-intelligence
 * Instance: #accordion-FAQ (FAQ section with expandable questions/answers)
 * Generated: 2026-03-12 (Dell page is JS-rendered; selectors target fully-rendered DOM)
 *
 * Block library structure (2 columns):
 *   Each row: question/title (cell 1) | answer/content (cell 2)
 */
export default function parse(element, { document }) {
  const cells = [];

  // FAQ items are <details> elements with <summary> for question and .faq-answer for answer
  const faqItems = Array.from(element.querySelectorAll('details.faq-item, .faq-item'));

  if (faqItems.length > 0) {
    faqItems.forEach((item) => {
      const questionEl = item.querySelector('.faq-question, summary p, summary');
      const answerEl = item.querySelector('.faq-answer, .faq-answer-container');

      const questionText = questionEl ? questionEl.textContent.trim() : '';
      const answerContent = answerEl || '';

      if (questionText) {
        cells.push([questionText, answerContent]);
      }
    });
  } else {
    // Fallback: look for generic accordion patterns
    const items = Array.from(element.querySelectorAll('[class*="accordion-item"], details'));
    items.forEach((item) => {
      const title = item.querySelector('summary, [class*="title"], [class*="header"], h3, h4');
      const content = item.querySelector('[class*="content"], [class*="body"], [class*="answer"]');

      if (title && content) {
        cells.push([title.textContent.trim(), content]);
      }
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
