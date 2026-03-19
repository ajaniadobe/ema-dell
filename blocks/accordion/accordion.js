function updateControls(expandBtn, collapseBtn, allDetails) {
  const allOpen = [...allDetails].every((d) => d.open);
  const allClosed = [...allDetails].every((d) => !d.open);

  expandBtn.disabled = allOpen;
  collapseBtn.disabled = allClosed;
}

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

  const separator = document.createElement('span');
  separator.textContent = ' | ';

  const collapseBtn = document.createElement('button');
  collapseBtn.textContent = 'Collapse All';

  expandBtn.addEventListener('click', () => {
    allDetails.forEach((d) => { d.open = true; });
    updateControls(expandBtn, collapseBtn, allDetails);
  });

  collapseBtn.addEventListener('click', () => {
    allDetails.forEach((d) => { d.open = false; });
    updateControls(expandBtn, collapseBtn, allDetails);
  });

  // Update states when individual items toggle
  allDetails.forEach((d) => {
    d.addEventListener('toggle', () => {
      updateControls(expandBtn, collapseBtn, allDetails);
    });
  });

  controls.append(expandBtn, separator, collapseBtn);
  block.prepend(controls);

  // Set initial state (all collapsed → disable Collapse All)
  updateControls(expandBtn, collapseBtn, allDetails);
}
