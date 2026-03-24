export default function decorate(block) {
  const items = [...block.querySelectorAll(':scope > div')];
  items.forEach((item) => {
    item.classList.add('agreements-item');
    const cols = [...item.querySelectorAll(':scope > div')];
    // Each item has: col 0 = logo image, col 1 = optional text (description + link)
    if (cols[0]) cols[0].classList.add('agreements-logo');
    if (cols[1]) cols[1].classList.add('agreements-text');
  });
}
