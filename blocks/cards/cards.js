export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && (div.querySelector('picture') || div.querySelector(':scope > img'))) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);

  // Professional Services: group flat items (icon, heading, desc) into step cards
  const section = block.closest('.section');
  if (section && section.querySelector('#professional-services-for-ai')) {
    const items = [...ul.children].filter((li) => {
      // Skip empty separator items (no images and no text content)
      const hasImg = li.querySelector('img');
      const hasText = li.textContent.trim().length > 0;
      return hasImg || hasText;
    });
    const grouped = [];
    for (let i = 0; i < items.length; i += 3) {
      const stepLi = document.createElement('li');
      stepLi.className = 'cards-step';
      for (let j = i; j < Math.min(i + 3, items.length); j += 1) {
        while (items[j].firstChild) stepLi.append(items[j].firstChild);
      }
      grouped.push(stepLi);
    }
    ul.replaceChildren(...grouped);
  }
}
