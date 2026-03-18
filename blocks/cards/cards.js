/* Product data for portfolio cards (images/descriptions not captured during import) */
const portfolioProducts = {
  'AI switches': {
    img: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/page-specific/franchise-page/isg-networking-franchise/dell-powerswitch-z9864fon-rf-768x271.png?fmt=png-alpha&wid=768&hei=271',
    desc: 'High-performance switches with low latency and high throughput for deploying advanced AI clusters effectively.',
  },
  'Data center switches': {
    img: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/page-specific/franchise-page/isg-networking-franchise/dellemc-s5448f-on-rf-768x271.png?fmt=png-alpha&wid=768&hei=271',
    desc: 'Dense, high-capacity, top-of-rack or core/aggregation switches for building optimised data center leaf-and-spine fabrics.',
  },
  'Edge platforms': {
    img: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/page-specific/franchise-page/isg-networking-franchise/dell-powerswitch-e3248pxe-on-rf-768x271.png?fmt=png-alpha&wid=768&hei=271',
    desc: 'Modern, integrated edge solutions for bandwidth-intensive applications, Power-over-Ethernet (PoE) devices, and Internet-of-Things (IoT).',
  },
  'Networking Software': {
    img: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/page-specific/franchise-page/isg-networking-franchise/networking-software-sonic-smartfabric-768x271.png?fmt=png-alpha&wid=768&hei=271',
    desc: 'High-performance software for fabrics that power IT workloads and accelerate AI application deployment.',
  },
};

function decoratePortfolioCards(block) {
  const ul = block.querySelector('ul');
  if (!ul) return false;

  const items = [...ul.children];
  if (items.length < 12) return false;

  // Detect portfolio pattern: item[3] has bullets, item[4] has title, item[5] has explore
  const hasBullets = items[3]?.querySelector('ul li');
  const titleLink = items[4]?.querySelector('a');
  const exploreLink = items[5]?.querySelector('a');
  if (!hasBullets || !titleLink?.textContent.trim() || !exploreLink?.textContent.includes('Explore')) {
    return false;
  }

  // Group every 6 items into one product
  const products = [];
  for (let i = 0; i + 5 < items.length; i += 6) {
    const tLink = items[i + 4].querySelector('a');
    const title = tLink?.textContent.trim();
    if (title) {
      const bullets = [...items[i + 3].querySelectorAll('li')]
        .map((li) => li.textContent.trim());
      const eLink = items[i + 5].querySelector('a');
      const data = portfolioProducts[title] || {};

      products.push({
        title,
        desc: data.desc || '',
        img: data.img || '',
        bullets,
        exploreText: eLink?.textContent.trim() || `Explore ${title}`,
        exploreHref: eLink?.getAttribute('href') || tLink.getAttribute('href'),
      });
    }
  }

  if (products.length === 0) return false;

  // Set up section: add heading, dark theme, solutions anchor
  const section = block.closest('.section');
  if (section) {
    section.classList.add('dark');
    section.id = 'solutions';

    const heading = document.createElement('h2');
    heading.textContent = 'Explore networking solutions';
    const dc = document.createElement('div');
    dc.className = 'default-content';
    dc.append(heading);
    section.querySelector('.block-content')?.before(dc);
  }

  // Build portfolio card grid
  block.classList.add('portfolio');
  const grid = document.createElement('div');
  grid.className = 'portfolio-grid';

  products.forEach((p) => {
    const card = document.createElement('div');
    card.className = 'portfolio-card';

    // Image area
    if (p.img) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'portfolio-card-image';
      const img = document.createElement('img');
      img.src = p.img;
      img.alt = p.title;
      img.loading = 'lazy';
      imgWrap.append(img);
      card.append(imgWrap);
    }

    // Content area
    const content = document.createElement('div');
    content.className = 'portfolio-card-content';

    const h3 = document.createElement('h3');
    h3.textContent = p.title;
    content.append(h3);

    if (p.desc) {
      const desc = document.createElement('p');
      desc.className = 'portfolio-card-desc';
      desc.textContent = p.desc;
      content.append(desc);
    }

    if (p.bullets.length) {
      const bestFor = document.createElement('p');
      bestFor.className = 'portfolio-card-bestfor';
      bestFor.textContent = 'BEST FOR:';
      content.append(bestFor);

      const bulletList = document.createElement('ul');
      p.bullets.forEach((b) => {
        const li = document.createElement('li');
        li.textContent = b;
        bulletList.append(li);
      });
      content.append(bulletList);
    }

    // Explore button
    const btnWrap = document.createElement('div');
    btnWrap.className = 'portfolio-card-cta';
    const btn = document.createElement('a');
    btn.href = p.exploreHref;
    btn.textContent = p.exploreText;
    btn.className = 'portfolio-explore-btn';
    btnWrap.append(btn);
    content.append(btnWrap);

    card.append(content);
    grid.append(card);
  });

  block.textContent = '';
  block.append(grid);
  return true;
}

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

  // Check for portfolio cards pattern (Explore networking solutions)
  if (decoratePortfolioCards(block)) return;

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
