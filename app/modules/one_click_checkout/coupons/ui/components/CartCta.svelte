<script lang="ts">
  // svelte imports
  import { onMount } from 'svelte';

  // store imports
  import {
    areAllCartItemsShown,
    cartItems,
  } from 'one_click_checkout/cart/store';

  // utils / constant imports
  import { DEFAULT_CART_ITEMS_COUNT } from 'one_click_checkout/cart/constants';

  // i18n imports
  import { formatTemplateWithLocale } from 'i18n';
  import {
    VIEW_LESS_CTA,
    VIEW_MORE_CTA,
    VIEW_ONE_MORE_CTA,
  } from 'one_click_checkout/cart/i18n/label';
  import { locale, t } from 'svelte-i18n';

  // Analytics imports
  import { Events } from 'analytics';
  import cartEvents from 'one_click_checkout/cart/analytics';
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';

  export let screenName = '';

  let i18nCta = '';
  $: {
    if ($areAllCartItemsShown) {
      i18nCta = VIEW_LESS_CTA;
    } else if ($cartItems.length - DEFAULT_CART_ITEMS_COUNT === 1) {
      i18nCta = VIEW_ONE_MORE_CTA;
    } else {
      i18nCta = VIEW_MORE_CTA;
    }
  }

  onMount(() => {
    const screen_name = getCurrentScreen();
    Events.TrackBehav(cartEvents.VIEW_MORE_ITEMS_SHOWN, {
      screen_name: screenName || screen_name,
    });
  });

  const handleClick = (e) => {
    const screen_name = getCurrentScreen();
    if ($areAllCartItemsShown) {
      Events.TrackBehav(cartEvents.VIEW_LESS_CLICKED, {
        screen_name,
      });
    } else {
      Events.TrackBehav(cartEvents.VIEW_MORE_ITEMS_CLICKED, {
        screen_name,
        count_of_items_displayed: DEFAULT_CART_ITEMS_COUNT,
      });
    }
    $areAllCartItemsShown = !$areAllCartItemsShown;
  };
</script>

<button class="view-items-btn theme btn-theme" on:click={handleClick}>
  {formatTemplateWithLocale(
    i18nCta,
    { count: $cartItems.length - DEFAULT_CART_ITEMS_COUNT },
    $locale
  )}
</button>

<style>
  * {
    box-sizing: border-box;
    padding: 0px;
    margin: 0px;
  }

  .view-items-btn {
    font-size: 12px;
    font-weight: 600;
  }
</style>
