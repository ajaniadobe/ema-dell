function setBackgroundFocus(img) {
  const { title } = img.dataset;
  if (!title?.includes('data-focal')) return;
  delete img.dataset.title;
  const [x, y] = title.split(':')[1].split(',');
  img.style.objectPosition = `${x}% ${y}%`;
}

function decorateBackground(el, bg) {
  const bgPic = bg.querySelector('picture') || bg.querySelector('img');
  if (!bgPic) return;

  const img = bgPic.tagName === 'IMG' ? bgPic : bgPic.querySelector('img');
  if (img) setBackgroundFocus(img);

  const vidLink = bgPic.closest('a[href*=".mp4"], a[href*="-mp4"]');
  if (!vidLink) return;
  el.classList.add('has-video');
  const video = document.createElement('video');
  // DA may mangle .mp4 to -mp4; restore the correct extension for playback
  video.src = vidLink.href.replace(/-mp4$/, '.mp4');
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
  vidLink.parentElement.append(video, bgPic);
  vidLink.remove();
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

export default async function init(el) {
  const rows = [...el.querySelectorAll(':scope > div')];
  const fg = rows.pop();
  fg.classList.add('hero-foreground');
  decorateForeground(fg);
  if (rows.length) {
    const bg = rows.pop();
    bg.classList.add('hero-background');
    decorateBackground(el, bg);
  }
}
