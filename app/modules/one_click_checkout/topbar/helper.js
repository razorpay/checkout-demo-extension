// svelte imports
import { get } from 'svelte/store';

// i18n imports
import { locale } from 'svelte-i18n';
import { getTabTitle } from 'i18n';

// store imports
import {
  tabTitle,
  tabTitleLogo,
  breadcrumbItems,
} from 'one_click_checkout/topbar/store';

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

export function addTabInBreadcrumbs(label) {
  const addressTabIndex = get(breadcrumbItems).indexOf(label);
  if (addressTabIndex === -1) {
    breadcrumbItems.update((breadcrumbList) => {
      breadcrumbList.splice(1, 0, label);
      return breadcrumbList;
    });
  }
}

export function removeTabInBreadcrumbs(label) {
  const addressTabIndex = get(breadcrumbItems).indexOf(label);
  if (addressTabIndex !== -1) {
    breadcrumbItems.update((breadcrumbList) => {
      breadcrumbList.splice(addressTabIndex, 1);
      return breadcrumbList;
    });
  }
}
