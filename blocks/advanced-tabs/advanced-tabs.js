import { getConfig } from '../../scripts/ak.js';

const { log } = getConfig();

function getTabList(tabs, tabPanels, prefix) {
  const tabItems = tabs.querySelectorAll('li');
  const tabList = document.createElement('div');
  tabList.className = 'tab-list';
  tabList.role = 'tablist';

  for (const [idx, tab] of tabItems.entries()) {
    const btn = document.createElement('button');
    btn.role = 'tab';
    btn.id = `${prefix}-tab-${idx + 1}`;
    btn.textContent = tab.textContent;
    if (idx === 0) {
      btn.classList.add('is-active');
      tabPanels[0].classList.add('is-visible');
    }
    tabList.append(btn);

    btn.addEventListener('click', () => {
      // Remove all active styles
      tabList.querySelectorAll('button')
        .forEach((button) => { button.classList.remove('is-active'); });

      tabPanels.forEach((sec) => { sec.classList.remove('is-visible'); });
      tabPanels[idx].classList.add('is-visible');
      btn.classList.add('is-active');
    });
  }

  return tabList;
}

let tabInstanceId = 0;

export default function init(el) {
  // Find the top most parent where all tab sections live
  const parent = el.closest('.fragment-content, main');

  // Forefully hide parent because sections may not be loaded yet
  parent.style = 'display: none;';

  // Find the section that contains the actual block
  const currSection = el.closest('.section');

  // Find the tab items
  const tabs = el.querySelector('ul');
  if (!tabs) {
    log('Please add an unordered list to the advanced tabs block.');
    return;
  }

  // Generate unique prefix to avoid ID collisions with multiple instances
  tabInstanceId += 1;
  const prefix = `atab-${tabInstanceId}`;

  // Filter and format all sections that do not hold the tabs block
  const tabPanels = [...parent.querySelectorAll(':scope > .section')]
    .reduce((acc, section, idx) => {
      if (section !== currSection) {
        section.id = `${prefix}-tabpanel-${idx + 1}`;
        section.role = 'tabpanel';
        section.setAttribute('aria-labelledby', `${prefix}-tab-${idx + 1}`);
        acc.push(section);
      }
      return acc;
    }, []);

  const tabList = getTabList(tabs, tabPanels, prefix);

  tabs.remove();
  el.append(tabList, ...tabPanels);
  parent.removeAttribute('style');
}
