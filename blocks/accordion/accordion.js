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

  // Add Expand All / Collapse All controls
  const controls = document.createElement('div');
  controls.className = 'accordion-controls';

  const expandBtn = document.createElement('button');
  expandBtn.textContent = 'Expand All';
  expandBtn.addEventListener('click', () => {
    block.querySelectorAll('details').forEach((d) => { d.open = true; });
  });

  const separator = document.createElement('span');
  separator.textContent = ' / ';

  const collapseBtn = document.createElement('button');
  collapseBtn.textContent = 'Collapse All';
  collapseBtn.addEventListener('click', () => {
    block.querySelectorAll('details').forEach((d) => { d.open = false; });
  });

  controls.append(expandBtn, separator, collapseBtn);
  block.prepend(controls);
}
