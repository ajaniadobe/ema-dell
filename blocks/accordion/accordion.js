export default function decorate(block) {
  [...block.children].forEach((row) => {
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);

    const body = row.children[1];
    body.className = 'accordion-item-body';

    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });

  const allDetails = block.querySelectorAll('details');

  // Single-item accordion in dark section: open by default, skip controls
  const section = block.closest('.section');
  if (allDetails.length === 1 && section?.classList.contains('dark')) {
    allDetails[0].open = true;
    return;
  }

  // Add Expand All / Collapse All controls
  const controls = document.createElement('div');
  controls.className = 'accordion-controls';

  const expandBtn = document.createElement('button');
  expandBtn.textContent = 'Expand All';
  expandBtn.addEventListener('click', () => {
    allDetails.forEach((d) => { d.open = true; });
  });

  const separator = document.createElement('span');
  separator.textContent = ' / ';

  const collapseBtn = document.createElement('button');
  collapseBtn.textContent = 'Collapse All';
  collapseBtn.addEventListener('click', () => {
    allDetails.forEach((d) => { d.open = false; });
  });

  controls.append(expandBtn, separator, collapseBtn);
  block.prepend(controls);
}
