function toClassName(name) {
  return typeof name === 'string'
    ? name.toLowerCase().replace(/[^0-9a-z]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    : '';
}

function isVideoJunk(text) {
  const junkPatterns = [
    /^Video Player/i, /^Play Video/i, /^Play$/i, /^PlaySkip/i, /^Unmute$/i,
    /^Current Time/i, /^Duration/i, /^Loaded:/i, /^Stream Type/i, /^Seek to live/i,
    /^Remaining Time/i, /^Playback Rate$/i, /^Chapters$/i, /^Descriptions$/i,
    /^Captions$/i, /^Quality Levels$/i, /^Audio Track$/i, /^Fullscreen$/i,
    /^This is a modal/i, /^Beginning of dialog/i, /^End of dialog/i,
    /^Close Modal/i, /^Text$/i, /^Font/i, /^Caption Area/i, /^Text Background/i,
    /^Text Edge/i, /^ResetDone$/i, /Color.*Opacity/i, /^Proportional/i,
    /^None \(none\)$/i, /^Showing page/i, /^\d+\/\d+$/, /^\d+(\.\d+)?x$/,
    /^\d+% \(/, /^\/$/,
    /^descriptions off/i, /^captions settings/i, /^captions off/i,
    /^Previous Slide/i,
  ];
  return junkPatterns.some((p) => p.test(text));
}

function cleanTabPanel(container) {
  if (!container) return;

  const keep = new Set();
  const h3 = container.querySelector('h3');
  const h4 = container.querySelector('h4');

  // For tabs without h3/h4 structure (e.g., AI Partner Ecosystem),
  // only remove video junk text — keep everything else
  if (!h3 || !h4) {
    [...container.querySelectorAll('p')].forEach((p) => {
      const text = p.textContent.trim();
      if (text && isVideoJunk(text)) p.remove();
    });
    return;
  }

  container.querySelectorAll('h3, h4').forEach((el) => keep.add(el));

  // Keep use-case icon paragraphs (1x1.gif placeholder, 96x96 icons, or small images before text)
  const iconP = [...container.querySelectorAll('p')]
    .find((p) => {
      const img = p.querySelector('img');
      if (!img) return false;
      if (img.src.includes('1x1.gif') || img.src.includes('icon-set-96x96')) return true;
      // Detect small icons by their width/height attributes (e.g., 96x96 from DA)
      const w = parseInt(img.getAttribute('width'), 10);
      const h = parseInt(img.getAttribute('height'), 10);
      return w > 0 && w <= 96 && h > 0 && h <= 96;
    });
  if (iconP) {
    iconP.classList.add('tabs-icon');
    keep.add(iconP);
  }

  // Detect Brightcove video links before cleanup
  // They appear as separate <p><a href="brightcove...">...</a></p> paragraphs
  let brightcoveUrl = null;
  container.querySelectorAll('a[href*="players.brightcove.net"]').forEach((a) => {
    if (!brightcoveUrl) brightcoveUrl = a.getAttribute('href');
  });

  const seenImgSrcs = new Set();
  container.querySelectorAll('p').forEach((p) => {
    if (keep.has(p)) return;
    const text = p.textContent.trim();
    const hasImg = p.querySelector('img');
    const hasLink = p.querySelector('a');
    const isIconImg = hasImg && (hasImg.src.includes('1x1.gif') || hasImg.src.includes('icon-set-96x96')
      || (parseInt(hasImg.getAttribute('width'), 10) <= 96 && parseInt(hasImg.getAttribute('height'), 10) <= 96));
    const isSrcImg = hasImg && !isIconImg;
    const linkHref = hasLink
      ? hasLink.getAttribute('href') : null;
    const isEmptyLink = hasLink
      && (!linkHref || linkHref === '')
      && !text && !isSrcImg;

    const normSrc = isSrcImg
      ? hasImg.src.replace(/^https?:/, '') : '';
    if (isSrcImg && seenImgSrcs.has(normSrc)) return;
    if (isSrcImg) seenImgSrcs.add(normSrc);

    if (isEmptyLink) {
      // skip empty links without images
    } else if (
      hasLink && linkHref && linkHref.includes('players.brightcove.net')
    ) {
      // skip Brightcove link paragraphs (URL already captured)
    } else if (
      isSrcImg && hasLink
      && (!linkHref || linkHref === '')
    ) {
      const img = hasImg.cloneNode(true);
      p.replaceChildren(img);
      keep.add(p);
    } else if (
      (text.length > 3 && !isVideoJunk(text))
      || (hasLink && text.length > 3)
      || isSrcImg
    ) {
      keep.add(p);
    }
  });

  [...container.children].forEach((el) => {
    if (
      !keep.has(el)
      && el.tagName !== 'H3'
      && el.tagName !== 'H4'
    ) {
      el.remove();
    }
  });

  // Restructure: header (icon+title | desc+CTA),
  // video thumbnail, customer story
  if (!h3 || !h4) return;
  if (h3.parentElement !== container) return;
  if (h4.parentElement !== container) return;

  // Find split point at customer logo or H4
  let splitAt = h4;
  const prev = h4.previousElementSibling;
  if (prev && prev.querySelector('img')) splitAt = prev;

  const headerEls = [];
  const storyEls = [];
  let reachedSplit = false;
  [...container.children].forEach((el) => {
    if (el === splitAt) reachedSplit = true;
    if (reachedSplit) {
      storyEls.push(el);
    } else {
      headerEls.push(el);
    }
  });

  // Video thumbnail is the last image-only paragraph
  // (appears after the story link, not the customer logo)
  // Images may be wrapped in <a> tags with Brightcove video URLs
  let videoP = null;
  for (let i = storyEls.length - 1; i >= 0; i -= 1) {
    const el = storyEls[i];
    if (el.tagName === 'P' && el.textContent.trim() === '') {
      const img = el.querySelector(':scope > img, :scope > picture img, :scope > a > img, :scope > a > picture img');
      const imgW = parseInt(img?.getAttribute('width'), 10);
      const imgH = parseInt(img?.getAttribute('height'), 10);
      const isSmallIcon = imgW > 0 && imgW <= 96 && imgH > 0 && imgH <= 96;
      if (img && !img.src.includes('1x1.gif') && !img.src.includes('icon-set-96x96') && !isSmallIcon) {
        videoP = el;
        storyEls.splice(i, 1);
        break;
      }
    }
  }
  // Remove any remaining empty paragraphs
  const finalStory = storyEls.filter((el) => {
    if (el.tagName !== 'P') return true;
    return el.textContent.trim() !== ''
      || el.querySelector('img');
  });

  // Build header: left (icon + title), right (desc + CTA)
  const header = document.createElement('div');
  header.className = 'tabs-panel-header';
  const hLeft = document.createElement('div');
  hLeft.className = 'tabs-panel-header-left';
  const hRight = document.createElement('div');
  hRight.className = 'tabs-panel-header-right';

  headerEls.forEach((el) => {
    if (el === iconP || el === h3) {
      hLeft.append(el);
    } else {
      hRight.append(el);
    }
  });
  header.append(hLeft, hRight);

  // Build story section
  const story = document.createElement('div');
  story.className = 'tabs-panel-story';
  finalStory.forEach((el) => story.append(el));

  // Assemble: header, then story+video side-by-side
  container.append(header);
  if (videoP) {
    videoP.className = 'tabs-panel-video';
    // Add click-to-play if a Brightcove video URL was found
    if (brightcoveUrl) {
      videoP.dataset.videoSrc = brightcoveUrl;
      // Add play button overlay
      const playBtn = document.createElement('button');
      playBtn.className = 'tabs-video-play';
      playBtn.setAttribute('aria-label', 'Play video');
      playBtn.innerHTML = '<svg viewBox="0 0 80 80" width="80" height="80"><circle cx="40" cy="40" r="40" fill="rgba(0,0,0,0.6)"/><polygon points="32,24 32,56 58,40" fill="#fff"/></svg>';
      videoP.append(playBtn);
      // Click to play
      videoP.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.src = `${brightcoveUrl}&autoplay=true`;
        iframe.allow = 'autoplay; encrypted-media; fullscreen';
        iframe.setAttribute('allowfullscreen', '');
        iframe.className = 'tabs-video-iframe';
        videoP.replaceChildren(iframe);
        videoP.classList.add('tabs-panel-video-playing');
      });
    }
    // Wrap story + video side-by-side
    const storyRow = document.createElement('div');
    storyRow.className = 'tabs-panel-story-row';
    storyRow.append(story, videoP);
    container.append(storyRow);
  } else {
    container.append(story);
  }
}

function isImgParagraph(el) {
  return el.tagName === 'P' && el.querySelector('img') && el.textContent.trim() === '';
}

function structurePartnerCards(container, headerEls) {
  const children = [...container.children];
  const groups = [];
  let currentGroup = null;

  children.forEach((el) => {
    if (headerEls.has(el)) return;
    if (isImgParagraph(el)) {
      if (currentGroup) groups.push(currentGroup);
      currentGroup = { logo: el, items: [] };
    } else if (currentGroup) {
      currentGroup.items.push(el);
    }
  });
  if (currentGroup) groups.push(currentGroup);
  if (groups.length === 0) return;

  // Last text-only paragraph after last card may be a section-level footer CTA
  // (e.g., "Explore more accelerators") — but NOT a partner-specific CTA
  // (e.g., "Explore Tabnine Blueprint" belongs inside the Tabnine card)
  const lastGroup = groups[groups.length - 1];
  let footerCTA = null;
  if (lastGroup.items.length > 0) {
    const lastItem = lastGroup.items[lastGroup.items.length - 1];
    const prevItem = lastGroup.items.length > 1
      ? lastGroup.items[lastGroup.items.length - 2] : null;
    if (prevItem && lastItem.querySelector('a:only-child') && prevItem.querySelector('a:only-child')) {
      const text = lastItem.textContent.trim().toLowerCase();
      // Collect partner keywords from logo alt texts to exclude partner-specific CTAs
      const partnerWords = groups.flatMap((g) => {
        const img = g.logo.querySelector('img');
        if (!img) return [];
        return img.alt.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter((w) => w.length > 3);
      });
      const isPartnerSpecific = partnerWords.some((w) => text.includes(w));
      if (text.startsWith('explore') && !isPartnerSpecific) {
        footerCTA = lastItem;
        lastGroup.items.pop();
      }
    }
  }

  const grid = document.createElement('div');
  grid.className = 'tabs-partner-cards';

  groups.forEach((group) => {
    const card = document.createElement('div');
    card.className = 'tabs-partner-card';

    const logoWrap = document.createElement('div');
    logoWrap.className = 'tabs-partner-card-logo';
    const img = group.logo.querySelector('img');
    if (img) logoWrap.append(img);
    card.append(logoWrap);

    const content = document.createElement('div');
    content.className = 'tabs-partner-card-content';
    group.items.forEach((item) => content.append(item));
    card.append(content);

    grid.append(card);
    group.logo.remove();
  });

  container.append(grid);
  if (footerCTA) {
    footerCTA.classList.add('tabs-partner-footer-cta');
    container.append(footerCTA);
  }
}

function decorateResourceCards(block) {
  // Only apply to tabs with the 'resource' variant class
  if (!block.classList.contains('resource')) return;

  const panels = block.querySelectorAll('[role=tabpanel]');
  let hasResourceContent = false;

  panels.forEach((panel) => {
    const content = panel.querySelector(':scope > div:last-child');
    if (!content) return;

    // Resource panels have h3 headings but NO h4 or h5
    const allH3s = content.querySelectorAll('h3');
    if (allH3s.length === 0 || content.querySelector('h4') || content.querySelector('h5')) return;

    hasResourceContent = true;

    // Mark category labels (all-uppercase paragraphs without links/images)
    const labelSet = new Set();
    content.querySelectorAll('p').forEach((p) => {
      const text = p.textContent.trim();
      if (text && text === text.toUpperCase() && text.length > 2
        && !p.querySelector('a') && !p.querySelector('img')) {
        p.classList.add('tabs-resource-label');
        labelSet.add(p);
      }
    });

    // Remove orphaned non-label, non-heading elements at the start (tab title echoes)
    while (content.firstElementChild
      && content.firstElementChild.tagName !== 'H3'
      && !labelSet.has(content.firstElementChild)) {
      content.firstElementChild.remove();
    }

    // Group cards: each h3 forms a card, pulling in its preceding label
    const cards = [];
    const seenH3 = new Set();
    allH3s.forEach((h3) => {
      // Deduplicate cards with the same h3 text
      const h3Text = h3.textContent.trim();
      if (seenH3.has(h3Text)) return;
      seenH3.add(h3Text);

      const card = [];
      // Include preceding category label if present
      const prev = h3.previousElementSibling;
      if (prev && labelSet.has(prev)) card.push(prev);

      // Add h3 and following elements until next label or h3
      card.push(h3);
      let next = h3.nextElementSibling;
      while (next && next.tagName !== 'H3' && !labelSet.has(next)) {
        card.push(next);
        next = next.nextElementSibling;
      }
      cards.push(card);
    });
    if (cards.length === 0) return;

    // Build carousel container
    const carousel = document.createElement('div');
    carousel.className = 'tabs-resource-carousel';

    cards.forEach((cardEls) => {
      const card = document.createElement('div');
      card.className = 'tabs-resource-card';
      cardEls.forEach((el) => card.append(el));
      carousel.append(card);
    });

    // Build navigation
    const nav = document.createElement('div');
    nav.className = 'tabs-resource-nav';

    const counter = document.createElement('span');
    counter.className = 'tabs-resource-counter';
    counter.textContent = `1 of ${cards.length}`;

    const arrows = document.createElement('div');
    arrows.className = 'tabs-resource-arrows';

    const prevBtn = document.createElement('button');
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.innerHTML = '&#8592;';
    prevBtn.disabled = true;

    const nextBtn = document.createElement('button');
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.innerHTML = '&#8594;';
    if (cards.length <= 1) nextBtn.disabled = true;

    arrows.append(prevBtn, nextBtn);
    nav.append(counter, arrows);

    // Scroll handling to update counter and button states
    let currentIndex = 0;
    const updateNav = () => {
      counter.textContent = `${currentIndex + 1} of ${cards.length}`;
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= cards.length - 1;
    };

    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex -= 1;
        const cardEl = carousel.children[currentIndex];
        carousel.scrollTo({ left: cardEl.offsetLeft - carousel.offsetLeft, behavior: 'smooth' });
        updateNav();
      }
    });

    nextBtn.addEventListener('click', () => {
      if (currentIndex < cards.length - 1) {
        currentIndex += 1;
        const cardEl = carousel.children[currentIndex];
        carousel.scrollTo({ left: cardEl.offsetLeft - carousel.offsetLeft, behavior: 'smooth' });
        updateNav();
      }
    });

    // Detect scroll position changes (user swipe or drag)
    carousel.addEventListener('scrollend', () => {
      const { scrollLeft } = carousel;
      let closest = 0;
      let minDist = Infinity;
      [...carousel.children].forEach((card, idx) => {
        const dist = Math.abs(card.offsetLeft - carousel.offsetLeft - scrollLeft);
        if (dist < minDist) {
          minDist = dist;
          closest = idx;
        }
      });
      currentIndex = closest;
      updateNav();
    });

    // Clear content and append carousel + nav
    content.replaceChildren(carousel, nav);
  });

  if (hasResourceContent) {
    block.classList.add('tabs-resource');
  }
}

function decorateAwards(block) {
  // Find sibling default-content with #awards-and-reviews in the same section
  const section = block.closest('.section');
  if (!section) return;
  const awardsContainer = section.querySelector('.default-content:has(#awards-and-reviews)');
  if (!awardsContainer) return;

  const awardsH2 = awardsContainer.querySelector('#awards-and-reviews');
  if (!awardsH2) return;

  // Remove junk paragraphs (nav text, counters)
  [...awardsContainer.querySelectorAll('p')].forEach((p) => {
    const text = p.textContent.trim();
    if (text && isVideoJunk(text)) p.remove();
  });
  // Remove counter patterns like "1/2", "1/4"
  [...awardsContainer.querySelectorAll('p')].forEach((p) => {
    if (/^\d+\/\d+$/.test(p.textContent.trim())) p.remove();
  });

  // Capture subtitle before DOM manipulation moves elements
  const subtitleEl = awardsH2.nextElementSibling;
  const subtitleP = (subtitleEl && subtitleEl.tagName === 'P') ? subtitleEl : null;

  // Group award cards: each h3 starts a card with preceding source label
  const h3s = awardsContainer.querySelectorAll('h3');
  if (h3s.length === 0) return;

  const cards = [];
  h3s.forEach((h3) => {
    const card = document.createElement('div');
    card.className = 'awards-card';

    // Look for source label (p before h3 with short text, no link/img)
    const prev = h3.previousElementSibling;
    if (prev && prev.tagName === 'P' && !prev.querySelector('a')
      && !prev.querySelector('img') && prev.textContent.trim().length < 30
      && prev !== awardsH2 && prev !== awardsH2.nextElementSibling) {
      const sourceEl = document.createElement('span');
      sourceEl.className = 'awards-source';
      sourceEl.textContent = prev.textContent.trim();
      card.append(sourceEl);
    }

    // Capture next sibling BEFORE moving h3 (appending moves it out of container)
    let next = h3.nextElementSibling;
    card.append(h3);

    // Collect following elements until next source+h3 pattern
    while (next) {
      const isSourceForNext = next.tagName === 'P' && !next.querySelector('a')
        && !next.querySelector('img') && next.textContent.trim().length < 30
        && next.nextElementSibling && next.nextElementSibling.tagName === 'H3';
      if (next.tagName === 'H3' || isSourceForNext) break;
      const nextSibling = next.nextElementSibling;
      card.append(next);
      next = nextSibling;
    }

    // Clean up duplicate link text (e.g., "Read about this award  Read about Product of the Year")
    card.querySelectorAll('a').forEach((a) => {
      const text = a.textContent.trim();
      const parts = text.split(/\s{2,}/);
      if (parts.length > 1) {
        [a.textContent] = parts;
      }
    });

    cards.push(card);
  });

  if (cards.length === 0) return;

  // Build carousel
  const carousel = document.createElement('div');
  carousel.className = 'awards-carousel';
  cards.forEach((card) => carousel.append(card));

  // Build navigation
  const nav = document.createElement('div');
  nav.className = 'awards-nav';

  const counter = document.createElement('span');
  counter.className = 'awards-counter';
  counter.textContent = `1/${cards.length}`;

  const arrows = document.createElement('div');
  arrows.className = 'awards-arrows';

  const prevBtn = document.createElement('button');
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.innerHTML = '&#8592;';
  prevBtn.disabled = true;

  const nextBtn = document.createElement('button');
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.innerHTML = '&#8594;';
  if (cards.length <= 1) nextBtn.disabled = true;

  arrows.append(prevBtn, nextBtn);
  nav.append(counter, arrows);

  // Carousel scroll handling
  let currentIndex = 0;
  const updateNav = () => {
    counter.textContent = `${currentIndex + 1}/${cards.length}`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= cards.length - 1;
  };

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      carousel.children[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      updateNav();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < cards.length - 1) {
      currentIndex += 1;
      carousel.children[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      updateNav();
    }
  });

  carousel.addEventListener('scrollend', () => {
    const { scrollLeft } = carousel;
    let closest = 0;
    let minDist = Infinity;
    [...carousel.children].forEach((card, idx) => {
      const dist = Math.abs(card.offsetLeft - carousel.offsetLeft - scrollLeft);
      if (dist < minDist) {
        minDist = dist;
        closest = idx;
      }
    });
    currentIndex = closest;
    updateNav();
  });

  // Replace container content: keep h2, subtitle, add carousel + nav
  awardsContainer.replaceChildren();
  awardsContainer.append(awardsH2);
  if (subtitleP) awardsContainer.append(subtitleP);
  awardsContainer.append(carousel, nav);
}

function decoratePartnerTabs(block) {
  const panels = block.querySelectorAll('[role=tabpanel]');
  let hasPartnerContent = false;

  panels.forEach((panel) => {
    const content = panel.querySelector(':scope > div:last-child');
    if (!content) return;

    const h5 = content.querySelector('h5');
    if (!h5 || content.querySelector('h3')) return;
    hasPartnerContent = true;

    // Hide duplicate tab label (first paragraph that matches tab name)
    const firstP = content.querySelector('p');
    if (firstP && !firstP.querySelector('img') && firstP.textContent.trim().length < 30) {
      firstP.classList.add('tabs-partner-label');
    }

    // Collect header elements (h5, description before first logo)
    const headerEls = new Set();
    for (const el of [...content.children]) {
      if (isImgParagraph(el)) break;
      headerEls.add(el);
    }

    // Count image paragraphs vs text paragraphs after header
    const imgPs = [...content.querySelectorAll('p')].filter(
      (p) => isImgParagraph(p),
    );
    let textAfterLogos = 0;
    let foundFirstImg = false;
    [...content.children].forEach((el) => {
      if (isImgParagraph(el)) foundFirstImg = true;
      if (foundFirstImg && el.tagName === 'P' && !el.querySelector('img') && el.textContent.trim()) {
        textAfterLogos += 1;
      }
    });

    // Logo-only grid (Ecosystem tab): many logos, no text between them
    if (imgPs.length > 5 && textAfterLogos === 0) {
      const grid = document.createElement('div');
      grid.className = 'tabs-partner-grid';
      imgPs.forEach((p) => {
        p.classList.add('tabs-partner-logo');
        grid.append(p);
      });
      content.append(grid);
    } else {
      // Card layout (AI Accelerator, Data, Models, Deploy tabs)
      structurePartnerCards(content, headerEls);
    }
  });

  if (hasPartnerContent) {
    block.classList.add('tabs-partner');
  }
}

export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // Clean up video player junk and structure content
    // The first child div is the tab label, the second is the content
    const content = tabpanel.querySelector(':scope > div:last-child');
    cleanTabPanel(content);

    const button = document.createElement('button');
    button.className = 'tabs-tab';
    button.id = `tab-${id}`;
    // Fix tab label: add spaces in PascalCase and remove duplicate subheadings
    let label = tab.textContent.trim();
    label = label.replace(/([a-z])([A-Z])/g, '$1 $2');
    // Remove duplicate text (e.g. "Latest Updates Latest updates")
    const half = Math.floor(label.length / 2);
    const firstHalf = label.substring(0, half).toLowerCase();
    const secondHalf = label.substring(half).trim().toLowerCase();
    if (half > 3 && firstHalf === secondHalf) {
      label = label.substring(0, half).trim();
    }
    // Strip section heading prefix from tab label
    // (e.g., "Networking Resources Technical resources" -> "Technical resources")
    const sectionEl = block.closest('.section');
    if (sectionEl) {
      const sectionH2 = sectionEl.querySelector(':scope > .default-content > h2');
      if (sectionH2) {
        const h2Text = sectionH2.textContent.trim();
        if (label.startsWith(h2Text) && label.length > h2Text.length) {
          label = label.substring(h2Text.length).trim();
        }
      }
    }
    button.textContent = label;
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
  });

  block.prepend(tablist);

  // Apply dark section styling if the preceding section is dark
  const section = block.closest('.section');
  if (section) {
    const prevSection = section.previousElementSibling;
    if (prevSection && prevSection.classList.contains('dark') && !section.classList.contains('light')) {
      section.classList.add('dark');
    }
  }

  // Structure AI Resources tabs (resource cards carousel)
  decorateResourceCards(block);

  // Structure Awards and reviews section (sibling to tabs in same section)
  decorateAwards(block);

  // Structure AI Partner Ecosystem tabs (logo grid + partner cards)
  decoratePartnerTabs(block);
}
