// svelte imports
import { get } from 'svelte/store';

// store imports
import { tabTitleLogo, breadcrumbItems } from 'one_click_checkout/topbar/store';

// utils imports
import { isOneClickCheckout } from 'razorpay';

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
