import { setView, destroyView } from './index';
import { getSession } from 'sessionmanager';

import InternationalTab from 'ui/tabs/international/index.svelte';
import { querySelector } from 'utils/doc';
const COMPONENT_KEY = 'internationalTab';

export function render(props = {}) {
  const internationalTab = new InternationalTab({
    target: querySelector('#form-fields'),
    props,
  });

  // moving bottom to bottom :D
  /**
   * its require because mounting of providers happen on click on international tab
   * bottom contain dcc, offers related UI & it suppose to below our payment methods
   * without this wallet tab is added after bottom which prevent DCC to show properly on screen(check Bottom.svelte).
   */
  if (document.getElementById('form-fields')) {
    document
      .getElementById('form-fields')
      .appendChild(document.getElementById('bottom'));
  }
  setView(COMPONENT_KEY, internationalTab);
  getSession()[COMPONENT_KEY] = internationalTab;
  internationalTab.onShown();

  return internationalTab;
}

export function destroy() {
  destroyView(COMPONENT_KEY);
  getSession()[COMPONENT_KEY] = null;
}
