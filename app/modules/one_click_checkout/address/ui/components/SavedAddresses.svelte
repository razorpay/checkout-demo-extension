<script>
  // svelte imports
  import { onMount, createEventDispatcher } from 'svelte';

  // ui imports
  import Icon from 'ui/elements/Icon.svelte';
  import AddressBox from 'one_click_checkout/address/ui/components/AddressBox.svelte';

  // store imports
  import { savedAddresses } from 'one_click_checkout/address/store';
  import { selectedAddressId as selectedShippingAddressId } from 'one_click_checkout/address/shipping_address/store';

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
  import { ADDRESS_TYPES } from 'one_click_checkout/address/constants';

  // session imports
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import {
    loadAddressesWithServiceability,
    postAddressSelection,
  } from 'one_click_checkout/address/sessionInterface';

  export let addresses = savedAddresses;
  export let checkServiceability = true;
  export let selectedAddressId;
  export let onAddAddressClick;
  export let addressType;

  const dispatch = createEventDispatcher();

  const { add_square } = getIcons();

  function dispatchServiceability(id, index) {
    dispatch('select', {
      addressId: id,
      addressIndex: index,
    });
  }

  function handleRadioClick(id, index) {
    selectedAddressId.set(id);
    if (!checkServiceability) return;

    postAddressSelection(id, index);
    dispatchServiceability(id, index);
  }

  function getSavedAddresses() {
    if (addressType === ADDRESS_TYPES.SHIPPING_ADDRESS) return $addresses;
    return $addresses.filter(
      (_addr) => _addr.id !== $selectedShippingAddressId
    );
  }

  onMount(() => {
    if ($addresses.length) {
      if (checkServiceability) {
        // shipping address

        if ($checkServiceabilityStatus === SERVICEABILITY_STATUS.UNCHECKED) {
          loadAddressesWithServiceability(true);
        } else if (!$selectedAddressId) {
          selectedAddressId.set($addresses[0].id);
        }
      } else {
        // billing address

        // select the 2nd billing address if 1st address is selected for shipping
        if (!$selectedAddressId) {
          if ($selectedShippingAddressId === $addresses[0].id) {
            selectedAddressId.set($addresses[1].id);
          } else {
            selectedAddressId.set($addresses[0].id);
          }
        }
        dispatchServiceability();
      }
    }
    merchantAnalytics({
      event: ACTIONS.PAGE_VIEW,
      category: CATEGORIES.ADDRESS,
      params: {
        page_title: CATEGORIES.ADDRESS,
      },
    });
    Events.Track(AddressEvents.SAVED_ADDRESS_SCREEN, {
      count: $addresses.length,
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
    {#each getSavedAddresses() as s_address, index}
      <div class="address-box">
        <AddressBox
          address={s_address}
          on:select={() => handleRadioClick(s_address.id, index)}
          on:editClick
          isSelected={$selectedAddressId === s_address.id}
          {checkServiceability}
          loading={$checkServiceabilityStatus === SERVICEABILITY_STATUS.LOADING}
        />
      </div>
    {/each}
  </div>
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
    margin: 22px 0px 28px;
    padding: 12px 16px;
    border: 1px dashed #8d97a1;
    border-radius: 4px;
  }

  .add-label {
    color: #263a4a;
    margin-left: 6px;
  }

  .address-box {
    margin-bottom: 24px;
  }
</style>
