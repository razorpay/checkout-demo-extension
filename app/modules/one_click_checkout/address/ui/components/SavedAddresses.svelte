<script>
  // svelte imports
  import { onMount, createEventDispatcher } from 'svelte';
  // store imports
  import { savedAddresses } from 'one_click_checkout/address/store';
  import { selectedAddress } from 'one_click_checkout/address/shipping_address/store';
  import {
    shippingCharge,
    codChargeAmount,
  } from 'one_click_checkout/charges/store';
  // service import
  import { postServiceability } from 'one_click_checkout/address/service';
  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    NON_SERVICEABLE_LABEL,
    ADD_ADDRESS_LABEL,
  } from 'one_click_checkout/address/i18n/labels';
  // analytics import
  import { Events } from 'analytics';
  import AddressEvents from 'one_click_checkout/address/analytics';

  export let addresses = savedAddresses;
  export let checkServiceability = true;
  export let selectedAddressId;
  export let onAddAddressClick;
  export let addressType;

  let isAddressServiceable;

  const dispatch = createEventDispatcher();

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

    const { zipcode } = $selectedAddress;
    const payload = [{ zipcode }];
    postServiceability(payload).then((res) => {
      postAddressSelection(res, zipcode, id, index);
    });
  }

  function hydrateSamePincodeAddresses(data, zipcode) {
    const newAddresses = $addresses.map((item) => {
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
  }

  onMount(() => {
    if ($addresses.length > 0) {
      selectedAddressId.set($addresses[0].id);
      dispatchServiceability();
    }
    if (checkServiceability) {
      const { zipcode } = $selectedAddress;
      const payload = [{ zipcode }];
      postServiceability(payload, true).then((res) => {
        postAddressSelection(res, zipcode, $addresses[0].id, 0);
      });
    } else {
      dispatchServiceability();
    }
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
  <div class="address-add" on:click={onAddAddressClick}>
    <div class="address-add-icon">+</div>
    <div class="add-label">
      {$t(ADD_ADDRESS_LABEL)}
    </div>
  </div>

  <div class="address-saved">
    {#each $addresses as s_address, index}
      <button
        class="address-container"
        class:selected-container={$selectedAddressId === s_address.id}
        on:click={(e) => {
          e.preventDefault();
          handleRadioClick(s_address.id, index);
          if (checkServiceability) {
            setShippingForSelectedAddress();
          }
        }}
      >
        <div class="address-content">
          <div class="address-details">
            <div class="address-name">
              {s_address['name']}
              {#if s_address['tag']}
                <div class="address-tag">{s_address['tag']}</div>
              {/if}
            </div>
            <div class="address-text address-font--12">
              <div>
                <!-- the regex deletes any leading or trailing commas -->
                {`${s_address['line1'] ?? ''}, ${s_address['line2'] ?? ''}`
                  .trim()
                  .replace(/(^,)|(,$)/g, '')}
              </div>
              <div>
                {`${s_address['city']}, ${s_address['state']}, ${s_address['zipcode']}`}
              </div>
              {#if s_address['landmark']}
                <div class="address-font--12">
                  {`Landmark: ${s_address['landmark']}`}
                </div>
              {/if}
              {#if s_address['contact']}
                <div>
                  {`Phone no: ${s_address['contact']}`}
                </div>
              {/if}
              <!-- s_address['serviceability'] will be null for unknown serviceability -->
              {#if s_address['serviceability'] === false && checkServiceability}
                <div class="address-serviceability-error">
                  {$t(NON_SERVICEABLE_LABEL)}
                </div>
              {/if}
            </div>
          </div>
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .address-add {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: normal;
    margin: 12px 0 16px;
    padding: 12px 16px;
    color: var(--highlight-color);
    background-color: var(--sec-highlight-color);
  }
  .address-add-icon {
    vertical-align: middle;
    display: inline-block;
    margin-right: 4px;
    font-size: 16px;
  }

  .add-label {
    font-weight: bold;
  }

  .address-font--12 {
    font-size: 12px;
  }
  .address-serviceability-error {
    font-size: 11px;
    margin-top: 4px;
    color: #eb001b;
    background: #fff1f1;
    border-radius: 1px;
    padding: 4px 8px;
  }
  .address-container {
    background: #fdfdfd;
    border: 1px solid #e6e7e8;
    display: block;
    width: 100%;
    margin-bottom: 24px;
    text-align: left;
    text-align: start;
    padding: 12px 20px;
    box-sizing: border-box;
    box-shadow: 2px 2px 16px rgba(52, 68, 85, 0.15);

    transition-duration: 0.15s;
    transition-property: border, background;
    transition-timing-function: linear;
  }
  .address-content {
    line-height: 22px;
    font-size: 14px;
  }
  .address-name {
    font-weight: bold;
    margin-bottom: 4px;
  }
  .address-tag {
    float: right;
    font-size: 10px;
    font-weight: bold;
    color: var(--highlight-color);
    background: var(--sec-highlight-color);
    border-radius: 16px;
    padding: 4px 12px;
  }
  .address-text {
    opacity: 0.7;
  }

  .selected-container {
    border: 1px solid var(--background-color);
  }
</style>
