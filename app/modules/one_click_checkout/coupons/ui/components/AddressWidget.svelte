<script>
  // svelte imports
  import { createEventDispatcher } from 'svelte';

  // ui imports
  import AddressBox from 'one_click_checkout/address/ui/components/AddressBox.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import SameBillingAndShipping from 'one_click_checkout/address/ui/components/SameBillingAndShipping.svelte';

  //store imports
  import { savedAddresses } from 'one_click_checkout/address/store';

  //session imports
  import { getIcons } from 'one_click_checkout/sessionInterface';

  // i18n imports
  import {
    ADDRESS_CTA_LABEL,
    ADDRESS_SECTION_LABEL,
    TOTAL_ADDRESSES_LABEL,
  } from 'one_click_checkout/coupons/i18n/labels';
  import { formatTemplateWithLocale } from 'i18n';
  import { locale, t } from 'svelte-i18n';

  const { location } = getIcons();
  const dispatch = createEventDispatcher();

  export let loading;
  export let address;
</script>

<div>
  {#if !loading}
    <div
      class:mb-14={$savedAddresses.length <= 1}
      class="flex-row col-center label-container"
    >
      <div class="flex-row col-center">
        <Icon icon={location} />
        <span class="label-text">{$t(ADDRESS_SECTION_LABEL)}</span>
      </div>
      <button
        on:click={() => dispatch('headerCtaClick')}
        class="label-cta theme"
      >
        {$t(ADDRESS_CTA_LABEL)}
      </button>
    </div>
    {#if $savedAddresses.length > 1}
      <p class="label-cta total-addresses">
        ({formatTemplateWithLocale(
          TOTAL_ADDRESSES_LABEL,
          { count: $savedAddresses.length },
          $locale
        )})
      </p>
    {/if}
  {/if}
  <AddressBox {address} {loading} withBorder={false} isEditable={false} />
  {#if !loading} <SameBillingAndShipping --text-color="#8d97a1" />{/if}
</div>

<style>
  * {
    padding: 0px;
    margin: 0px;
    box-sizing: border-box;
  }

  .flex-row {
    display: flex;
  }

  .col-center {
    align-items: center;
  }

  .label-container {
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
  }

  .label-text {
    color: #263a4a;
    font-size: 14px;
    text-transform: capitalize;
    margin-left: 8px;
    font-weight: bold;
  }

  .label-cta {
    font-size: 12px;
    text-align: right;
    font-weight: 600;
  }
  .total-addresses {
    position: relative;
    top: -6px;
    margin-bottom: 2px;
    color: #8d97a1;
    font-weight: 300;
  }

  .mb-14 {
    margin-bottom: 14px;
  }
</style>
