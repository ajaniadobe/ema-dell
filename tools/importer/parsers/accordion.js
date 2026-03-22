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

  // Pattern A: FAQ items as <details> elements with <summary> for question and .faq-answer for answer
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
    // Pattern B: Generic accordion patterns (DDS accordion items, details elements)
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
      // Pattern C: Button-based FAQ (industry pages: button[id*='button'] + div[id*='answer'])
      const faqButtons = Array.from(element.querySelectorAll('button[id*="button"]'));
      const faqAnswers = Array.from(element.querySelectorAll('div[id*="answer"]'));
      if (faqButtons.length > 0 && faqAnswers.length > 0) {
        faqButtons.forEach((btn, idx) => {
          const questionText = btn.textContent.trim();
          if (!questionText || /^faq/i.test(questionText) || /frequently asked/i.test(questionText)) return;
          const answerEl = faqAnswers[idx];
          if (answerEl) {
            const answerCopy = answerEl.querySelector('.rwp-faq-item__answer--copy') || answerEl;
            cells.push([questionText, answerCopy]);
          }
        });
      } else {
        // Pattern D: Raw FAQ - h3 questions followed by p answers (no accordion markup)
        // Common on Dell solutions/services pages where FAQ is a plain container
        const headings = Array.from(element.querySelectorAll('h3'));
        headings.forEach((h3) => {
          const questionText = h3.textContent.trim();
          // Skip section title headings (e.g., "Frequently Asked Questions", "FAQ's")
          if (!questionText || /^faq/i.test(questionText) || /frequently asked/i.test(questionText)) return;

          // Collect all sibling p elements until the next h3 or h2
          const answerParts = [];
          let sibling = h3.nextElementSibling;
          while (sibling && sibling.tagName !== 'H3' && sibling.tagName !== 'H2') {
            if (sibling.tagName === 'P' && sibling.textContent.trim()) {
              answerParts.push(sibling.textContent.trim());
            }
            sibling = sibling.nextElementSibling;
          }

          if (answerParts.length > 0) {
            const answerDiv = document.createElement('div');
            answerParts.forEach((text) => {
              const p = document.createElement('p');
              p.textContent = text;
              answerDiv.appendChild(p);
            });
            cells.push([questionText, answerDiv]);
          }
        });
      }
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
