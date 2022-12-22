import ShippingOptionsList from 'one_click_checkout/shipping_options/ui/List.svelte';
import { pushOverlay } from 'navstack';

export function pushShippingOptionsOverlay(options = [], continueCallback) {
  pushOverlay({
    component: ShippingOptionsList,
    props: {
      options,
      onContinue: continueCallback,
      isOverlay: true,
    },
  });
}
