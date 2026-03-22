function setBackgroundFocus(img) {
  const { title } = img.dataset;
  if (!title?.includes('data-focal')) return;
  delete img.dataset.title;
  const [x, y] = title.split(':')[1].split(',');
  img.style.objectPosition = `${x}% ${y}%`;
}

async function getVideoSrc(bg) {
  // Pattern 1: <a> link wrapping/near picture
  const img = bg.querySelector('img');
  const vidLink = (img && img.closest('a[href*=".mp4"], a[href*="-mp4"]'))
    || bg.querySelector('a[href*=".mp4"], a[href*="-mp4"]');
  if (vidLink) {
    const src = vidLink.href.replace(/-mp4$/, '.mp4');
    vidLink.remove();
    return src;
  }

  // Pattern 2: plain text URL in background
  const vidTextEl = [...bg.querySelectorAll(':scope > div')]
    .find((d) => /https?:\/\/[^\s]+\.mp4/.test(d.textContent) && !d.querySelector('picture, img'));
  if (vidTextEl) {
    const src = vidTextEl.textContent.trim().match(/https?:\/\/[^\s]+\.mp4/)?.[0];
    vidTextEl.remove();
    if (src) return src;
  }

  return null;
}

async function decorateBackground(el, bg) {
  const bgPic = bg.querySelector('picture') || bg.querySelector('img');
  if (!bgPic) return;

  const img = bgPic.tagName === 'IMG' ? bgPic : bgPic.querySelector('img');
  if (img) setBackgroundFocus(img);

  const vidSrc = await getVideoSrc(bg);
  if (!vidSrc) {
    if (!el.classList.contains('overlay')) {
      el.classList.add('split');
    }
    return;
  }

  el.classList.add('has-video');
  const video = document.createElement('video');
  video.src = vidSrc;
  video.loop = true;
  video.muted = true;
  video.inert = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('preload', 'none');
  video.load();
  video.addEventListener('canplay', () => {
    video.play();
    bgPic.remove();
  });

  bgPic.parentElement.append(video);
}

function decorateForeground(fg) {
  const { children } = fg;
  let firstCta = true;
  const ctaDivs = [];
  for (const [idx, child] of [...children].entries()) {
    const heading = child.querySelector('h1, h2, h3, h4, h5, h6');
    const text = heading || child.querySelector('p, a, ul');
    if (heading) {
      heading.classList.add('hero-heading');
      const detail = heading.previousElementSibling;
      if (detail) {
        detail.classList.add('hero-detail');
      }
    }
    // Determine foreground column types
    if (text) {
      child.classList.add('fg-text');
      if (idx === 0) {
        child.closest('.hero').classList.add('hero-text-start');
      } else {
        child.closest('.hero').classList.add('hero-text-end');
      }
    }
    // Detect CTA links: a div whose only child element is an <a> tag
    const link = child.querySelector(':scope > a:only-child');
    if (link && !heading) {
      link.classList.add('btn');
      if (firstCta) {
        link.classList.add('btn-primary');
        firstCta = false;
      } else {
        link.classList.add('btn-secondary');
      }
      ctaDivs.push(child);
    }
  }
  // Group multiple CTA buttons into one container
  if (ctaDivs.length > 1) {
    const group = ctaDivs[0];
    group.classList.add('hero-cta-group');
    ctaDivs.slice(1).forEach((div) => {
      group.append(div.querySelector('a'));
      div.remove();
    });
  }
}

function detectPartnerLogo(el) {
  const desc = document.querySelector('meta[name="description"]')?.content?.toLowerCase() || '';
  const partners = ['intel', 'nvidia'];
  for (const partner of partners) {
    if (desc.includes(partner)) {
      el.classList.add(partner);
      break;
    }
  }
}

export default async function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  const fg = rows.pop();
  fg.classList.add('hero-foreground');
  decorateForeground(fg);
  if (rows.length) {
    const bg = rows.pop();
    bg.classList.add('hero-background');
    await decorateBackground(el, bg);
  }
  // Overlay variant: wrap all foreground children in a single content box
  if (el.classList.contains('overlay')) {
    const contentBox = document.createElement('div');
    contentBox.classList.add('hero-overlay-box');
    [...fg.children].forEach((child) => contentBox.append(child));
    fg.append(contentBox);
  }
  detectPartnerLogo(el);
}
