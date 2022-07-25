<script lang="ts">
  // svelte imports
  import { createEventDispatcher, onMount } from 'svelte';

  // store imports
  import {
    areAllCartItemsShown,
    cartItems,
  } from 'one_click_checkout/cart/store';
  import { getCartExperiment } from 'one_click_checkout/store';

  // utils / constant imports
  import {
    CART_EXPERIMENTS,
    DEFAULT_CART_ITEMS_COUNT,
  } from 'one_click_checkout/cart/constants';

  // i18n imports
  import { formatTemplateWithLocale } from 'i18n';
  import {
    VIEW_ITEMS_CTA,
    VIEW_LESS_CTA,
    VIEW_MORE_CTA,
    VIEW_ONE_MORE_CTA,
  } from 'one_click_checkout/cart/i18n/label';
  import { locale, t } from 'svelte-i18n';

  // Analytics imports
  import { Events } from 'analytics';
  import cartEvents from 'one_click_checkout/cart/analytics';
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';

  export let variant = '';
  export let screenName = '';

  const dispatch = createEventDispatcher();
  const currentExperiment = getCartExperiment();

  let i18nCtaForVariantB = '';
  $: {
    if ($areAllCartItemsShown) {
      i18nCtaForVariantB = VIEW_LESS_CTA;
    } else if ($cartItems.length - DEFAULT_CART_ITEMS_COUNT === 1) {
      i18nCtaForVariantB = VIEW_ONE_MORE_CTA;
    } else {
      i18nCtaForVariantB = VIEW_MORE_CTA;
    }
  }

  onMount(() => {
    const screen_name = getCurrentScreen();
    if (
      variant === CART_EXPERIMENTS.VARIANT_A &&
      currentExperiment === CART_EXPERIMENTS.VARIANT_A
    ) {
      Events.TrackBehav(cartEvents.VIEW_ITEM_DETAILS_SHOWN, {
        screen_name: screenName || screen_name,
      });
    } else if (
      variant === CART_EXPERIMENTS.VARIANT_B &&
      currentExperiment === CART_EXPERIMENTS.VARIANT_B
    ) {
      Events.TrackBehav(cartEvents.VIEW_MORE_ITEMS_SHOWN, {
        screen_name: screenName || screen_name,
      });
    }
  });

  const handleClick = (e) => {
    const screen_name = getCurrentScreen();
    if ($areAllCartItemsShown) {
      Events.TrackBehav(cartEvents.VIEW_LESS_CLICKED, {
        screen_name,
      });
    } else {
      if (currentExperiment === CART_EXPERIMENTS.VARIANT_A) {
        Events.TrackBehav(cartEvents.VIEW_ITEM_DETAILS_CLICKED, {
          screen_name,
          count_of_items_displayed_in_list: $cartItems.length,
        });
      } else if (currentExperiment === CART_EXPERIMENTS.VARIANT_B) {
        Events.TrackBehav(cartEvents.VIEW_MORE_ITEMS_CLICKED, {
          screen_name,
          count_of_items_displayed: DEFAULT_CART_ITEMS_COUNT,
        });
      }
    }
    $areAllCartItemsShown = !$areAllCartItemsShown;
  };
</script>

{#if variant === CART_EXPERIMENTS.VARIANT_A && currentExperiment === CART_EXPERIMENTS.VARIANT_A}
  <button class="view-items-btn theme" on:click={handleClick}>
    {$t($areAllCartItemsShown ? VIEW_LESS_CTA : VIEW_ITEMS_CTA)}
  </button>
{:else if variant === CART_EXPERIMENTS.VARIANT_B && currentExperiment === CART_EXPERIMENTS.VARIANT_B}
  <button class="view-items-btn theme btn-theme-B" on:click={handleClick}>
    {formatTemplateWithLocale(
      i18nCtaForVariantB,
      { count: $cartItems.length - DEFAULT_CART_ITEMS_COUNT },
      $locale
    )}
  </button>
{/if}

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
