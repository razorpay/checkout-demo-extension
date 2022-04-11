// svelte imports
import { get } from 'svelte/store';

// store imports
import { activeRoute } from 'one_click_checkout/routing/store';

// session imports
import { getSessionTab } from 'one_click_checkout/account_modal/sessionInterface';

// constant imports
import { SCREEN_LIST } from 'one_click_checkout/analytics/constants';

export const getCurrentScreen = () => {
  const tab = getSessionTab();
  const currentScreen =
    tab === 'home-1cc' ? get(activeRoute).name : tab || 'methods';

  return SCREEN_LIST[currentScreen];
};
