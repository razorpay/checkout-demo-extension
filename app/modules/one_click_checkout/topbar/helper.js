// svelte imports
import { get } from 'svelte/store';

// store imports
import { breadcrumbItems } from 'one_click_checkout/topbar/store';

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
