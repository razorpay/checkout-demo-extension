// svelte imports
import { get } from 'svelte/store';

// i18n imports
import { locale } from 'svelte-i18n';
import { getTabTitle } from 'i18n';

// store imports
import { tabTitle, tabTitleLogo } from 'one_click_checkout/topbar/store';

// utils imports
import { isOneClickCheckout } from 'razorpay';

export function setTabTitle(tab) {
  if (isOneClickCheckout()) {
    tabTitle.set(getTabTitle(tab, get(locale)));
  }
}

export function setTabTitleLogo(tabLogo) {
  if (isOneClickCheckout()) {
    tabTitleLogo.set(tabLogo);
  }
}
