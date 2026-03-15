/* eslint-disable max-len */
const PARTNER_LOGOS = {
  'AMD logo': '//i.dell.com/is/image/DellContent/content/dam/ss2/page-specific/category-pages/ai/partners/amd-p-blk-691x451.png?fmt=png-alpha&wid=691&hei=451',
  'Intel Corporate Logo': '//i.dell.com/is/image/DellContent/content/dam/ss2/non-product-images/icons/ai-partner-logos/intel.png?fmt=png-alpha&wid=450&hei=300',
  'Nvidia corporate logo/Blk-Green': '//i.dell.com/is/image/DellContent/content/dam/ss2/non-product-images/icons/ai-partner-logos/nvidia.png?fmt=png-alpha&wid=450&hei=300',
  'Qualcomm Logo': '//i.dell.com/is/image/DellContent/content/dam/ss2/page-specific/category-pages/ai/partners/dell-ai-solutions-logo-qualcomm.png?fmt=png-alpha&wid=878&hei=212',
  'Broadcom logo': '//i.dell.com/is/image/DellContent/content/dam/web-resources/project-specific/artificial-intelligence/generative-ai/images/dell-ai-solutions-logo-broadcom-small.svg?fmt=png-alpha',
  Cloudera: '//i.dell.com/is/image/DellContent/content/dam/ss2/non-product-images/icons/ai-partner-logos/cloudera.png?fmt=png-alpha&wid=450&hei=300',
  'Cohere logo': '//i.dell.com/is/image/DellContent/content/dam/ss2/page-specific/category-pages/ai/partners/cohere-logo-color-rgb-450x300.png?fmt=png-alpha&wid=450&hei=300',
  Databricks: '//i.dell.com/is/image/DellContent/content/dam/ss2/non-product-images/icons/ai-partner-logos/databricks.png?fmt=png-alpha&wid=450&hei=300',
  'Equinix Logo': '//i.dell.com/is/image/DellContent/content/dam/ss2/non-product-images/icons/equinix-logo.png?fmt=png-alpha&wid=960&hei=640',
  'Glean logo': '//i.dell.com/is/image/DellContent/content/dam/ss2/page-specific/category-pages/ai/partners/glean-wordmark-bl-450x300.png?fmt=png-alpha&wid=450&hei=300',
  'Google Cloud logo': '//i.dell.com/is/image/DellContent/content/dam/ss2/page-specific/category-pages/ai/partners/googlecloud-fullcolor-rgb-450x300.png?fmt=png-alpha&wid=450&hei=300',
  'Hugging Face': '//i.dell.com/is/image/DellContent/content/dam/ss2/non-product-images/icons/ai-partner-logos/huggingface.png?fmt=png-alpha&wid=450&hei=300',
  Meta: '//i.dell.com/is/image/DellContent/content/dam/ss2/non-product-images/icons/ai-partner-logos/meta.png?fmt=png-alpha&wid=450&hei=300',
  'microsoft image dell for startups': '//i.dell.com/is/image/DellContent/content/dam/ss2/non-product-images/icons/microsoft.jpg?fmt=jpg&wid=800&hei=451',
  'Nutanix Logo': '//i.dell.com/is/image/DellContent/content/dam/ss2/page-specific/category-pages/ai/partners/nutanix-logo-450x300.png?fmt=png-alpha&wid=450&hei=300',
  'Red Hat': '//i.dell.com/is/image/DellContent/content/dam/ss2/non-product-images/icons/ai-partner-logos/red-hat.png?fmt=png-alpha&wid=450&hei=300',
  'NVIDIA & Run:AI logo': '//i.dell.com/is/image/DellContent/content/dam/ss2/page-specific/category-pages/ai/partners/nvidia-and-run-ai-partnership-lockup-v-on-light-og-450x300.png?fmt=png-alpha&wid=450&hei=300',
  Snowflake: '//i.dell.com/is/image/DellContent/content/dam/ss2/non-product-images/icons/ai-partner-logos/snowflake.png?fmt=png-alpha&wid=450&hei=300',
  'Starbust Logo': '//i.dell.com/is/image/DellContent/content/dam/web-resources/project-specific/artificial-intelligence/generative-ai/images/dell-ai-solutions-logo-starburst-691x451.png?fmt=png-alpha&wid=691&hei=451',
  'Tabnine logo': '//i.dell.com/is/image/DellContent/content/dam/ss2/page-specific/category-pages/ai/partners/tabnine-logo-450x300.png?fmt=png-alpha&wid=450&hei=300',
  teradata: '//i.dell.com/is/image/DellContent/content/dam/web-resources/cross-project/images/lifestyle/teradata.png?fmt=png-alpha&wid=3876&hei=1374',
  'Meta Llama logo': '//i.dell.com/is/image/DellContent/content/dam/web-resources/project-specific/artificial-intelligence/generative-ai/images/dell-ai-solutions-logo-meta-llama-691x451.png?fmt=png-alpha&wid=691&hei=451',
  'Dell Technologies Logo': '//i.dell.com/is/image/DellContent/content/dam/images/logos/dell-technologies/horizontal/digital/delltech-logo-prm-blue-rgb.png?fmt=png-alpha&wid=4238&hei=550',
  'AMD ROCm logo': '//i.dell.com/is/image/DellContent/content/dam/ss2/page-specific/category-pages/ai/partners/amd-rocm-lockup-rgb-blk-691x451.png?fmt=png-alpha&wid=691&hei=451',
  OpenVINO: '//i.dell.com/is/image/DellContent/content/dam/ss2/non-product-images/icons/ai-partner-logos/openvino.png?fmt=png-alpha&wid=450&hei=300',
  'run ai logo': '//i.dell.com/is/image/DellContent/content/dam/web-resources/project-specific/artificial-intelligence/generative-ai/images/dell-ai-solutions-logo-run-ai-691x451.png?fmt=png-alpha&wid=691&hei=451',
};
/* eslint-enable max-len */

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

  // Keep use-case icon paragraphs (1x1.gif placeholder or 96x96 SVG icons)
  const iconP = [...container.querySelectorAll('p')]
    .find((p) => p.querySelector('img[src*="1x1.gif"], img[src*="icon-set-96x96"]'));
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
      const img = el.querySelector(':scope > img, :scope > a > img');
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
    container.append(videoP);
  }
  container.append(story);
}

function replacePartnerLogos(container) {
  container.querySelectorAll('img').forEach((img) => {
    if (img.src.includes('1x1.gif')) {
      const url = PARTNER_LOGOS[img.alt.trim()];
      if (url) img.src = `https:${url}`;
    }
  });
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

function decoratePartnerTabs(block) {
  const panels = block.querySelectorAll('[role=tabpanel]');
  let hasPartnerContent = false;

  panels.forEach((panel) => {
    const content = panel.querySelector(':scope > div:last-child');
    if (!content) return;

    const h5 = content.querySelector('h5');
    if (!h5 || content.querySelector('h3')) return;
    hasPartnerContent = true;

    // Replace 1x1.gif logos with real URLs
    replacePartnerLogos(content);

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

  // Structure AI Partner Ecosystem tabs (logo grid + partner cards)
  decoratePartnerTabs(block);
}
