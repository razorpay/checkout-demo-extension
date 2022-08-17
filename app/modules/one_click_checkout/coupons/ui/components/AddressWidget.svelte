<script lang="ts">
  // svelte imports
  import { createEventDispatcher, onMount } from 'svelte';

  // ui imports
  import Icon from 'ui/elements/Icon.svelte';
  import AddressBox from 'one_click_checkout/address/ui/components/AddressBox.svelte';
  import SameBillingAndShipping from 'one_click_checkout/address/ui/components/SameBillingAndShipping.svelte';
  import AddressStatusIndicator from 'one_click_checkout/coupons/ui/components/AddressStatusIndicator.svelte';

  //store imports
  import { savedAddresses } from 'one_click_checkout/address/store';
  import { selectedAddress } from 'one_click_checkout/address/shipping_address/store';

  //session imports
  import { getIcons } from 'one_click_checkout/sessionInterface';

  // constant imports
  import { DELIVERY_ADDRESS_WIDGET_DOM_ID } from 'one_click_checkout/coupons/constants';

  // i18n imports
  import {
    ADDRESS_CTA_LABEL,
    ADDRESS_SECTION_LABEL,
    TOTAL_ADDRESSES_LABEL,
  } from 'one_click_checkout/coupons/i18n/labels';
  import { formatTemplateWithLocale } from 'i18n';
  import { locale, t } from 'svelte-i18n';

  // analytics imports
  import { Events } from 'analytics';
  import CouponEvents from 'one_click_checkout/coupons/analytics';

  // helper imports
  import { getServiceability } from 'one_click_checkout/address/controller';

  const { location } = getIcons();
  const dispatch = createEventDispatcher();

  export let loading = false;

  const handleChangeAddress = () => {
    Events.TrackBehav(CouponEvents.SUMMARY_EDIT_ADDRESS_CLICKED);
    dispatch('headerCtaClick');
  };

  const handleToggle = () => {
    Events.TrackBehav(CouponEvents.SUMMARY_ADDRESS_SHIPPING_UNCHECKED);
  };

  function checkAddressServiceability(address) {
    loading = true;
    getServiceability(address).then(() => {
      loading = false;
    });
  }

  onMount(() => {
    checkAddressServiceability($selectedAddress);
  });
</script>

<div class="address-widget-container" id={DELIVERY_ADDRESS_WIDGET_DOM_ID}>
  <div
    class:mb-14={$savedAddresses.length <= 1}
    class="flex-row col-center label-container"
  >
    <div class="flex-row col-center">
      <Icon icon={location} />
      <span class="label-text">{$t(ADDRESS_SECTION_LABEL)}</span>
    </div>
    <button
      data-test-id="manage-address-cta"
      on:click={handleChangeAddress}
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
  <AddressBox address={$selectedAddress} withBorder={false} isEditable={false}>
    <SameBillingAndShipping
      on:toggle={handleToggle}
      disabled={loading || !$selectedAddress?.serviceability}
    />
    <AddressStatusIndicator
      serviceable={$selectedAddress?.serviceability}
      {loading}
    />
  </AddressBox>
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
    align-items: center;
  }

  .label-text {
    color: #263a4a;
    font-size: 14px;
    text-transform: capitalize;
    margin-left: 8px;
    font-weight: 600;
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

  .address-widget-container :global(.same-address-checkbox .checkbox-text) {
    color: #8d97a1;
  }
</style>
