<script lang="ts">
  // svelte imports
  import { onMount, createEventDispatcher } from 'svelte';

  // ui imports
  import Icon from 'ui/elements/Icon.svelte';
  import AddressBox from 'one_click_checkout/address/ui/components/AddressBox.svelte';
  import AddressConsentBanner from 'one_click_checkout/address/consent/ui/AddressConsentBanner.svelte';

  // store imports
  import { selectedAddress as selectedShippingAddress } from 'one_click_checkout/address/shipping_address/store';
  import { selectedAddressId as selectedBillingAddressId } from 'one_click_checkout/address/billing_address/store';
  import { activeRoute } from 'one_click_checkout/routing/store';
  import { showBanner } from 'one_click_checkout/address/store';
  import { shippingCharge } from 'one_click_checkout/charges/store';

  // service import
  import { checkServiceabilityStatus } from 'one_click_checkout/address/shipping_address/store';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { ADD_ADDRESS_LABEL } from 'one_click_checkout/address/i18n/labels';

  // analytics import
  import { Events } from 'analytics';
  import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
  import AddressEvents from 'one_click_checkout/address/analytics';

  // constant imports
  import {
    CATEGORIES,
    ACTIONS,
  } from 'one_click_checkout/merchant-analytics/constant';
  import { SERVICEABILITY_STATUS } from 'one_click_checkout/address/constants';
  import { views } from 'one_click_checkout/routing/constants';

  // session imports
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import {
    loadAddressesWithServiceability,
    postAddressSelection,
  } from 'one_click_checkout/address/sessionInterface';

  // util imports
  import { screenScrollTop } from 'one_click_checkout/helper';
  import { showShippingChargeAddedToast } from 'one_click_checkout/address/helpersExtra';

  export let addresses;
  export let checkServiceability = true;
  export let selectedAddressId;
  export let onAddAddressClick;
  export let addressType;
  export let addressWrapperEle;

  const dispatch = createEventDispatcher();

  const { add_square } = getIcons();
  const defaultAddressType = 'magic_saved';

  function dispatchSelect(id, index) {
    dispatch('select', {
      addressId: id,
      addressIndex: index,
    });
  }

  function handleRadioClick(id, index, addressSource) {
    if ($activeRoute?.name === views.SAVED_ADDRESSES) {
      Events.TrackBehav(AddressEvents.SAVED_SHIPPING_ADDRESS_SELECTED, {
        address_id: id,
        address_position_index: index,
        address_source: addressSource || defaultAddressType,
        selection_type: 'manual',
      });
      Events.TrackBehav(AddressEvents.TOP_SHOWN_SHIPPING_ADDRESS, {
        top_shown_address: !index,
      });
    } else {
      Events.TrackBehav(AddressEvents.SAVED_BILLING_ADDRESS_SELECTED, {
        address_id: id,
        address_position_index: index,
      });
      Events.TrackBehav(AddressEvents.TOP_SHOWN_BILLING_ADDRESS, {
        top_shown_address: !index,
      });
    }
    selectedAddressId.set(id);
    dispatchSelect(id, index);
    if (!checkServiceability) {
      return;
    }
    const prevShippingCharge = $shippingCharge;
    postAddressSelection(id, index);
    if ($shippingCharge && $shippingCharge !== prevShippingCharge) {
      showShippingChargeAddedToast($shippingCharge);
    }
  }

  onMount(() => {
    screenScrollTop(addressWrapperEle);
    if (
      checkServiceability &&
      $checkServiceabilityStatus === SERVICEABILITY_STATUS.UNCHECKED
    ) {
      loadAddressesWithServiceability(true);
    } else if (
      !$selectedAddressId ||
      addresses.findIndex((addr) => addr.id === $selectedAddressId) === -1
    ) {
      selectedAddressId.set(addresses[0].id);
    }
    dispatchSelect();
    if ($activeRoute?.name === views.SAVED_BILLING_ADDRESS) {
      Events.TrackBehav(AddressEvents.SAVED_BILLING_ADDRESS_SELECTED, {
        address_id: $selectedBillingAddressId,
        address_position_index: 0,
      });
      Events.TrackBehav(AddressEvents.TOP_SHOWN_BILLING_ADDRESS, {
        top_shown_address: true,
      });
    }
    if (
      $activeRoute?.name === views.SAVED_ADDRESSES &&
      $selectedShippingAddress?.id
    ) {
      Events.TrackRender(AddressEvents.SAVED_SHIPPING_ADDRESS_LOADED, {
        count_saved_addresses: addresses?.length,
      });
      Events.TrackBehav(AddressEvents.SAVED_SHIPPING_ADDRESS_SELECTED, {
        address_id: $selectedShippingAddress?.id,
        address_position_index: 0,
        address_source:
          $selectedShippingAddress?.source_type || defaultAddressType,
        selection_type: 'default',
      });
      Events.TrackBehav(AddressEvents.TOP_SHOWN_SHIPPING_ADDRESS, {
        top_shown_address: true,
      });
      postAddressSelection();
    }
    merchantAnalytics({
      event: ACTIONS.PAGE_VIEW,
      category: CATEGORIES.ADDRESS,
      params: {
        page_title: CATEGORIES.ADDRESS,
      },
    });
    Events.Track(AddressEvents.SAVED_ADDRESS_SCREEN, {
      count: addresses.length,
      type: addressType,
    });
  });
</script>

<div>
  <div id="address-add" class="address-add" on:click={onAddAddressClick}>
    <Icon icon={add_square} />
    <p class="add-label">
      {$t(ADD_ADDRESS_LABEL)}
    </p>
  </div>

  <div>
    {#each addresses as addr, index}
      <div class="address-box">
        <AddressBox
          address={addr}
          on:select={() => handleRadioClick(addr.id, index, addr?.source_type)}
          on:editClick
          isSelected={$selectedAddressId === addr.id}
          {checkServiceability}
          loading={$checkServiceabilityStatus ===
            SERVICEABILITY_STATUS.LOADING && !addr.serviceability}
        />
      </div>
    {/each}
  </div>

  {#if $showBanner}
    <AddressConsentBanner />
  {/if}
</div>

<style>
  * {
    margin: 0px;
    padding: 0px;
    border: 0px;
    box-sizing: border-box;
  }
  .address-add {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    margin: 16px 0px;
    padding: 10px 16px;
    border: 1px dashed var(--primary-text-color);
    border-radius: 4px;
  }

  .add-label {
    color: var(--primary-text-color);
    margin-left: 6px;
  }

  .address-box {
    margin-bottom: 16px;
  }

  .address-box:last-child {
    margin-bottom: 0;
  }
</style>
