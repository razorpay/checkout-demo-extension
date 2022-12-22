<script lang="ts">
  import { t } from 'svelte-i18n';
  // UI imports
  import ShippingOptionsList from 'one_click_checkout/shipping_options/ui/List.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  // analytics
  import { Events } from 'analytics';
  import ShippingOptionEvents from 'one_click_checkout/shipping_options/analytics';
  //icons
  import shipping from 'one_click_checkout/coupons/icons/shipping';
  import { DEFAULT_SHIPPING_OPTIONS_VISIBLE } from 'one_click_checkout/shipping_options/constants';
  import {
    HEADER_LABEL,
    VIEW_LESS_LABEL,
    VIEW_MORE_LABEL,
  } from 'one_click_checkout/shipping_options/i18n/labels';

  export let options = [];

  let expanded = false;

  const toggleItemsToShow = () => {
    expanded = !expanded;
    if (expanded) {
      Events.TrackBehav(ShippingOptionEvents.VIEW_MORE_CLICKED);
    }
  };
</script>

<div class="header">
  <div class="label">
    <span class="shipping-icon"><Icon icon={shipping()} /></span>
    {$t(HEADER_LABEL)}
  </div>
</div>
<ShippingOptionsList {options} bind:expanded />
{#if options.length > DEFAULT_SHIPPING_OPTIONS_VISIBLE}
  <button class="show-cta theme btn-theme" on:click={toggleItemsToShow}>
    {#if expanded}
      {$t(VIEW_LESS_LABEL)}
    {:else}
      {$t(VIEW_MORE_LABEL)}
    {/if}
  </button>
{/if}

<style lang="scss">
  * {
    box-sizing: border-box;
    margin: 0px;
    padding: 0px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .label {
    font-style: normal;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-body);
    line-height: 16px;
    text-transform: capitalize;
    display: flex;
    align-items: center;
  }
  .shipping-icon {
    margin-right: 8px;
    line-height: 0;
  }
  .show-cta {
    margin-top: 16px;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-semibold);
  }
</style>
