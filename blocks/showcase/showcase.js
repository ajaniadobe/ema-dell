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
}
