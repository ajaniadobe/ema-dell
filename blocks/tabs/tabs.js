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

  container.querySelectorAll('h3, h4').forEach((el) => keep.add(el));

  // Keep use-case icon paragraphs (1x1.gif placeholder or 96x96 SVG icons)
  const iconP = [...container.querySelectorAll('p')]
    .find((p) => p.querySelector('img[src*="1x1.gif"], img[src*="icon-set-96x96"]'));
  if (iconP) {
    iconP.classList.add('tabs-icon');
    keep.add(iconP);
  }

  const seenImgSrcs = new Set();
  container.querySelectorAll('p').forEach((p) => {
    if (keep.has(p)) return;
    const text = p.textContent.trim();
    const hasImg = p.querySelector('img');
    const hasLink = p.querySelector('a');
    const isIconImg = hasImg && (hasImg.src.includes('1x1.gif') || hasImg.src.includes('icon-set-96x96'));
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
  let videoP = null;
  for (let i = storyEls.length - 1; i >= 0; i -= 1) {
    const el = storyEls[i];
    if (el.tagName === 'P' && el.textContent.trim() === '') {
      const img = el.querySelector(':scope > img');
      if (img && !img.src.includes('1x1.gif') && !img.src.includes('icon-set-96x96')) {
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

  // Assemble: header, video, story
  container.append(header);
  if (videoP) {
    videoP.className = 'tabs-panel-video';
    container.append(videoP);
  }
  container.append(story);
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
}
