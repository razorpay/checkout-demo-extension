<script>
  // svelte imports
  import { onMount, createEventDispatcher } from 'svelte';
  // ui imports
  import Icon from 'ui/elements/Icon.svelte';
  import AddressBox from './AddressBox.svelte';
  // store imports
  import { savedAddresses } from 'one_click_checkout/address/store';
  import {
    selectedAddress,
    selectedAddressId as selectedShippingAddressId,
  } from 'one_click_checkout/address/shipping_address/store';
  import {
    shippingCharge,
    codChargeAmount,
  } from 'one_click_checkout/charges/store';
  // service import
  import { postServiceability } from 'one_click_checkout/address/service';
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
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { ADDRESS_TYPES } from 'one_click_checkout/address/constants';

  export let addresses = savedAddresses;
  export let checkServiceability = true;
  export let selectedAddressId;
  export let onAddAddressClick;
  export let addressType;

  let isAddressServiceable;

  const dispatch = createEventDispatcher();

  const { add_square } = getIcons();

  function dispatchServiceability(id, index) {
    dispatch('selectedAddressUpdate', {
      isAddressServiceable,
      addressId: id,
      addressIndex: index,
      is_cod_available: $selectedAddress.cod,
    });
  }

  function handleRadioClick(id, index) {
    selectedAddressId.set(id);
    if (!checkServiceability) return;

    const { zipcode, country } = $selectedAddress;
    const payload = [{ zipcode, country }];
    postServiceability(payload).then((res) => {
      postAddressSelection(res, zipcode, id, index);
    });
  }

  function hydrateSamePincodeAddresses(data, zipcode) {
    const newAddresses = $addresses.map((item) => {
      if (
        item.zipcode === item.country &&
        data[item.zipcode]?.hasOwnProperty('city') &&
        data[item.zipcode]?.hasOwnProperty('state')
      ) {
        delete data[item.zipcode].city;
        delete data[item.zipcode].state;
      }

      if (item.zipcode === zipcode) {
        return {
          ...item,
          ...data[item.zipcode],
        };
      }

      return item;
    });
    addresses.set(newAddresses);
  }

  function postAddressSelection(res, zipcode, id, index) {
    hydrateSamePincodeAddresses(res, zipcode);
    isAddressServiceable = $selectedAddress.serviceability;
    dispatchServiceability(id, index);
    setShippingForSelectedAddress();
    Events.TrackBehav(AddressEvents.SAVED_ADDRESS_SELECTED, {
      id,
      index,
      serviceable: isAddressServiceable,
    });
    merchantAnalytics({
      event: ACTIONS.SELECT_ADDRESS,
      category: CATEGORIES.ADDRESS,
      params: { zipcode },
    });
  }

  function getSavedAddresses() {
    if (addressType === ADDRESS_TYPES.SHIPPING_ADDRESS) return $addresses;
    return $addresses.filter(
      (_addr) => _addr.id !== $selectedShippingAddressId
    );
  }

  onMount(() => {
    if ($addresses.length > 0) {
      // select the 2nd billing address if 1st address is selected for shipping
      if (
        addressType === ADDRESS_TYPES.BILLING_ADDRESS &&
        $selectedShippingAddressId === $addresses[0].id
      )
        selectedAddressId.set($addresses[1].id);
      else selectedAddressId.set($addresses[0].id);
      dispatchServiceability();
    }
    if (checkServiceability) {
      const { zipcode, country } = $selectedAddress;
      const payload = [{ zipcode, country }];
      postServiceability(payload, true).then((res) => {
        postAddressSelection(res, zipcode, $addresses[0].id, 0);
      });
    } else {
      dispatchServiceability();
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

  const setShippingForSelectedAddress = () => {
    shippingCharge.set($selectedAddress.shipping_fee);
    codChargeAmount.set($selectedAddress.cod_fee);
  };
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
      <AddressBox
        address={s_address}
        on:selectAddress={() => handleRadioClick(s_address.id, index)}
        on:editAddressClick
        isSelected={$selectedAddressId === s_address.id}
        {checkServiceability}
      />
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
    margin: 16px 0 24px;
    padding: 12px 16px;
    border: 1px dashed #8d97a1;
    border-radius: 4px;
  }

  .add-label {
    color: #263a4a;
    margin-left: 6px;
  }
</style>
