<script>
  // svelte imports
  import { get } from 'svelte/store';
  // UI imports
  import CTA from 'ui/elements/CTA.svelte';
  import SavedAddresses from 'one_click_checkout/address/ui/components/SavedAddresses.svelte';
  import AddNewAddress from 'one_click_checkout/address/ui/components/AddNewAddress.svelte';
  // i18n imports
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  import { CTA_LABEL } from 'one_click_checkout/address/i18n/labels';
  // analytics imports
  import { Events } from 'analytics';
  import AddressEvents from 'one_click_checkout/address/analytics';
  // store imports
  import {
    savedAddresses,
    isBillingSameAsShipping,
  } from 'one_click_checkout/address/store';
  // helpers imports
  import { navigator } from 'one_click_checkout/routing/helpers/routing';
  import { validateInput } from 'one_click_checkout/address/helpers';
  // constants imports
  import Resource from 'one_click_checkout/address/resource';
  import {
    views as addressViews,
    ADDRESS_TYPES,
  } from 'one_click_checkout/address/constants';

  export let error;
  export let onSubmitCallback;
  export let currentView;
  export let addressType;

  let showCta = true;
  let disabled;
  let {
    title,
    store: {
      selectedAddressId,
      addressCompleted,
      shouldSaveAddress,
      newUserAddress,
    },
  } = Resource[addressType];

  let isFormComplete = false;

  export function handleAddAddressClick() {
    Events.Track(AddressEvents.ADD_NEW_ADDRESS_CLICKED);
    selectedAddressId.set('');
    currentView = addressViews.ADD_ADDRESS;
    navigator.navigateTo({
      path: Resource[addressType].routes[addressViews.ADD_ADDRESS],
    });
  }

  export function setCurrentView(view) {
    currentView = view;
  }

  export function handleAddressSelection({
    detail: { isAddressServiceable, addressId, addressIndex, is_cod_available },
  }) {
    Events.Track(AddressEvents.SAVED_ADDRESS_SELECTED, {
      serviceable: isAddressServiceable,
      address_id: addressId,
      address_index: addressIndex,
      is_cod_available,
    });
    showCta = true;
    if (Resource[addressType].checkServiceability) {
      showCta = isAddressServiceable;
    }
  }

  export function onSubmit() {
    if (currentView === addressViews.ADD_ADDRESS) {
      const elementId = Resource[addressType].formId;

      const inpError = validateInput(elementId);
      if (inpError) {
        error = inpError;
        error.text = formatTemplateWithLocale(
          error.label.text,
          { field: error.label.field },
          $locale
        );
        Events.Track(AddressEvents.ADDRESS_SUBMIT_CLICKED, {
          address_valid: false,
          is_saved_address: false,
          is_billing_same_as_shipping: $isBillingSameAsShipping,
          opted_for_save_address: $shouldSaveAddress,
        });
        return;
      }
    } else {
      if (!$selectedAddressId) {
        alert('Please Select the address');
        return;
      }
    }
    Events.Track(AddressEvents.ADDRESS_SUBMIT_CLICKED, {
      address_valid: true,
      is_saved_address: currentView === addressViews.SAVED_ADDRESSES,
      is_billing_same_as_shipping: $isBillingSameAsShipping,
      opted_to_save_address: $shouldSaveAddress,
    });
    onSubmitCallback(addressCompleted);
  }

  function onFormCompletion({ detail: { isComplete } }) {
    if (isFormComplete !== isComplete) {
      isFormComplete = isComplete;
      if (isComplete) {
        Events.Track(AddressEvents.ADD_ADDRESS_CTA_ENABLED, {
          address_label: get(Resource[addressType].store.newAddress)?.tag,
          pincode: get(Resource[addressType].store.newAddress)?.zipcode,
          is_cod_available: get(Resource[addressType].store.selectedAddress)
            ?.cod,
          is_serviceable: get(Resource[addressType].store.selectedAddress)
            ?.serviceable,
        });
      }
    }
  }

  $: {
    if (currentView) {
      document.body.scroll({
        top: 0,
        behavior: 'smooth',
      });
      document.documentElement.scroll({
        top: 0,
        behavior: 'smooth',
      });
    }
  }

  $: disabled =
    currentView === addressViews.ADD_ADDRESS ? !isFormComplete : !showCta;
</script>

<div class="address-tab">
  <slot name="header" />
  <div
    class="address-wrapper"
    class:shipping-address-wrapper={addressType ===
      ADDRESS_TYPES.SHIPPING_ADDRESS &&
      currentView === addressViews.ADD_ADDRESS}
    class:billing-address-wrapper={Resource[addressType].classes[
      'billing-address-wrapper'
    ]}
  >
    <slot name="inner-header" />
    <div class="address-shipping-label">
      {$t(title)}
    </div>
    {#if currentView === addressViews.SAVED_ADDRESSES}
      <SavedAddresses
        {selectedAddressId}
        addresses={savedAddresses}
        on:selectedAddressUpdate={handleAddressSelection}
        onAddAddressClick={handleAddAddressClick}
        checkServiceability={Resource[addressType].checkServiceability}
        {addressType}
      />
    {:else if currentView === addressViews.ADD_ADDRESS}
      <AddNewAddress
        on:formCompletion={onFormCompletion}
        id={Resource[addressType].formId}
        checkServiceability={Resource[addressType].checkServiceability}
        formData={newUserAddress}
        {error}
        {shouldSaveAddress}
        {addressType}
      />
    {/if}
    <slot name="inner-footer" />
  </div>
  <slot name="footer" />
  <CTA on:click={onSubmit} {disabled}>
    {$t(CTA_LABEL)}
  </CTA>
</div>

<style>
  .address-wrapper {
    padding: 18px 24px 0;
    overflow: auto;
    /* subtracting topbar and cta height from body's height for address-wrapper */
    height: calc(100% - 47px - 55px);
  }

  .address-tab {
    height: inherit;
  }

  .address-shipping-label {
    font-weight: normal;
    color: rgba(51, 51, 51, 0.6);
    font-size: 13px;
    padding-bottom: 6px;
    text-transform: uppercase;
  }
  .billing-address-wrapper {
    padding: 8px 24px 12px;
    /* subtracting topbar and cta height from body's height and adding the space left off by the footer checkbox */
    height: calc(
      100% - 47px - 55px + 20px + 16px
    ); /* 16 is because of the reduced vertical padding */
  }
  .shipping-address-wrapper {
    height: calc(
      100% - 47px - 55px + 20px + 10px
    ); /* add 10 for the reduced padding-bottom */
    padding-bottom: 8px;
  }
  :global(.address-label) {
    font-size: 14px;
  }
</style>
