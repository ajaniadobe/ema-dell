export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];

  // Row 0: background image
  // Row 1: content (heading + description + optional CTA)
  const bgRow = rows[0];
  const contentRow = rows[1];

  if (bgRow) {
    bgRow.classList.add('showcase-background');
    const pic = bgRow.querySelector('picture') || bgRow.querySelector('img');
    if (pic) {
      const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img');
      if (img) {
        img.loading = 'lazy';
      }
    }
  }

  if (contentRow) {
    contentRow.classList.add('showcase-content');
    const heading = contentRow.querySelector('h2');
    if (heading) heading.classList.add('showcase-heading');

    const ps = contentRow.querySelectorAll('p');
    ps.forEach((p) => {
      const link = p.querySelector('a:only-child');
      if (link) {
        link.classList.add('btn', 'btn-secondary');
      } else if (p.textContent.trim().length > 0) {
        p.classList.add('showcase-description');
      }
    });
  }

  // Parallax: translate the background image slower than scroll speed
  if (bgRow) {
    const img = bgRow.querySelector('img');
    if (!img) return;

    const onScroll = () => {
      const rect = block.getBoundingClientRect();
      const viewH = window.innerHeight;
      // Only animate while the block is near or in the viewport
      if (rect.bottom < -200 || rect.top > viewH + 200) return;
      // Progress: 0 when block enters bottom, 1 when block exits top
      const progress = 1 - (rect.bottom / (viewH + rect.height));
      // Shift image by up to ±15% of its container height
      const shift = (progress - 0.5) * 0.3;
      img.style.transform = `translateY(${shift * 100}%)`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
}
