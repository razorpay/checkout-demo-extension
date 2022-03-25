<script>
  // svelte imports
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';

  // UI imports
  import CTA from 'one_click_checkout/cta/index.svelte';
  import SavedAddresses from 'one_click_checkout/address/ui/components/SavedAddresses.svelte';
  import AddNewAddress from 'one_click_checkout/address/ui/components/AddNewAddress.svelte';
  import AccountTab from 'one_click_checkout/account_modal/ui/AccountTab.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // i18n imports
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  // analytics imports
  import { Events } from 'analytics';
  import AddressEvents from 'one_click_checkout/address/analytics';

  // store imports
  import {
    savedAddresses,
    isBillingSameAsShipping,
  } from 'one_click_checkout/address/store';
  import {
    selectedAddress,
    selectedAddressId as selectedShippingAddressId,
    selectedCountryISO as selectedShippingCountryISO,
  } from 'one_click_checkout/address/shipping_address/store';
  import { showAccountTab } from 'one_click_checkout/account_modal/store';

  // helpers imports
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { navigator } from 'one_click_checkout/routing/helpers/routing';
  import { validateInput } from 'one_click_checkout/address/helpers';
  import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
  import { formatAddressToFormData } from 'one_click_checkout/address/helpersExtra';
  import { isScrollableElement } from 'one_click_checkout/helper';
  import { isShowAccountTab } from 'one_click_checkout/account_modal/helper';

  // constants imports
  import Resource from 'one_click_checkout/address/resource';
  import {
    views as addressViews,
    ADDRESS_TYPES,
    ADDRESS_FORM_VIEWS,
  } from 'one_click_checkout/address/constants';
  import {
    CATEGORIES,
    ACTIONS,
  } from 'one_click_checkout/merchant-analytics/constant';
  import { INDIA_COUNTRY_CODE } from 'common/constants';

  export let error;
  export let onSubmitCallback;
  export let currentView;
  export let addressType;

  let addressWrapperEle;
  let scrollable = false;

  let addresses;
  $: {
    if (addressType === ADDRESS_TYPES.SHIPPING_ADDRESS) {
      addresses = $savedAddresses;
    } else {
      addresses = $savedAddresses.filter(
        (_addr) => _addr.id !== $selectedShippingAddressId
      );
    }
  }

  let disabled;
  let {
    title,
    store: {
      selectedAddressId,
      addressCompleted,
      shouldSaveAddress,
      newUserAddress,
      selectedCountryISO,
    },
  } = Resource[addressType];
  let isFormComplete = false;
  const { location } = getIcons();

  export function handleAddAddressClick() {
    Events.Track(AddressEvents.ADD_NEW_ADDRESS_CLICKED);
    Resource[addressType].store.resetAddress();
    currentView = addressViews.ADD_ADDRESS;
    navigator.navigateTo({
      path: Resource[addressType].routes[addressViews.ADD_ADDRESS],
    });
  }

  function handleEditAddressClick({ detail: _address }) {
    selectedAddressId.set(_address.id);
    if (_address.country) selectedShippingCountryISO.set(_address.country);
    newUserAddress.update((addr) => ({
      ...addr,
      ...formatAddressToFormData(_address),
    }));
    currentView = addressViews.EDIT_ADDRESS;
    navigator.navigateTo({
      path: Resource[addressType].routes[addressViews.EDIT_ADDRESS],
    });
  }

  export function setCurrentView(view) {
    currentView = view;
  }

  export function handleAddressSelection({
    detail: { addressId, addressIndex },
  }) {
    const { serviceability, cod } = $selectedAddress;
    Events.Track(AddressEvents.SAVED_ADDRESS_SELECTED, {
      serviceable: serviceability,
      address_id: addressId,
      address_index: addressIndex,
      is_cod_available: cod,
    });
  }

  export function onSubmit() {
    if (ADDRESS_FORM_VIEWS.includes(currentView)) {
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
          opted_to_save_address: !!$shouldSaveAddress,
        });
        return;
      }
      merchantAnalytics({
        event: `addnew_address_${ACTIONS.CTA_CLICKED}`,
        category: CATEGORIES.ADDRESS,
      });
    } else {
      if (!$selectedAddressId) {
        alert('Please Select the address');
        return;
      }
    }
    let analyticsData = {
      address_valid: true,
      is_saved_address: currentView === addressViews.SAVED_ADDRESSES,
      is_billing_same_as_shipping: $isBillingSameAsShipping,
      opted_to_save_address: !!$shouldSaveAddress,
    };
    if (addressType === ADDRESS_TYPES.SHIPPING_ADDRESS) {
      const { id, country } = $selectedAddress;
      if (id) {
        analyticsData.address_id = id;
      }
      analyticsData = {
        country_code: INDIA_COUNTRY_CODE,
        country: country || $selectedShippingCountryISO,
        ...analyticsData,
      };
    }
    Events.Track(AddressEvents.ADDRESS_SUBMIT_CLICKED, analyticsData);
    if (currentView === addressViews.SAVED_ADDRESSES) {
      merchantAnalytics({
        event: `saved_address_${ACTIONS.CTA_CLICKED}`,
        category: CATEGORIES.ADDRESS,
      });
    }
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

  function onScroll() {
    isShowAccountTab(addressWrapperEle);
  }

  onMount(() => {
    scrollable = isScrollableElement(addressWrapperEle);
  });

  $: {
    if (ADDRESS_FORM_VIEWS.includes(currentView)) {
      disabled = !isFormComplete;
    } else if (
      addressType === ADDRESS_TYPES.SHIPPING_ADDRESS &&
      currentView === addressViews.SAVED_ADDRESSES
    ) {
      disabled = !$selectedAddress.serviceability;
    } else {
      disabled = false;
    }
  }
</script>

<div class="address-tab">
  <div
    class="address-wrapper"
    class:shipping-address-wrapper={addressType ===
      ADDRESS_TYPES.SHIPPING_ADDRESS &&
      ADDRESS_FORM_VIEWS.includes(currentView)}
    class:billing-address-wrapper={Resource[addressType].classes[
      'billing-address-wrapper'
    ]}
    bind:this={addressWrapperEle}
    on:scroll={onScroll}
  >
    <div class="address-section" class:address-scrollable={scrollable}>
      <slot name="header" />
      <slot name="inner-header" />
      <div class="label-container">
        <Icon icon={location} />
        <p class="label-text">{$t(title)}</p>
      </div>
      {#if currentView === addressViews.SAVED_ADDRESSES}
        <SavedAddresses
          {selectedAddressId}
          {addresses}
          on:select={handleAddressSelection}
          on:editClick={handleEditAddressClick}
          onAddAddressClick={handleAddAddressClick}
          checkServiceability={Resource[addressType].checkServiceability}
          {addressType}
          {addressWrapperEle}
        />
      {:else if ADDRESS_FORM_VIEWS.includes(currentView)}
        <AddNewAddress
          on:formCompletion={onFormCompletion}
          id={Resource[addressType].formId}
          checkServiceability={Resource[addressType].checkServiceability}
          formData={newUserAddress}
          {error}
          {shouldSaveAddress}
          {addressType}
          {selectedCountryISO}
          {currentView}
          {addressWrapperEle}
        />
      {/if}
      <slot name="inner-footer" />
    </div>
    {#if $showAccountTab}
      <AccountTab />
    {/if}
  </div>
  <slot name="footer" />
  <CTA on:click={onSubmit} {disabled} />
</div>

<style>
  * {
    margin: 0px;
    padding: 0px;
    border: 0px;
  }

  .address-wrapper {
    display: flex;
    flex-direction: column;
    padding-top: 26px;
    overflow: auto;
    /* subtracting topbar and cta height from body's height for address-wrapper */
    height: calc(100% - 55px);
  }

  .address-tab {
    height: inherit;
  }

  .label-container {
    display: flex;
    align-items: center;
  }

  .label-text {
    color: #263a4a;
    font-size: 14px;
    text-transform: capitalize;
    margin-left: 8px;
    font-weight: 600;
  }

  .billing-address-wrapper {
    padding: 8px 0px 12px;
    /* subtracting topbar and cta height from body's height and adding the space left off by the footer checkbox */
    height: calc(
      100% - 55px + 20px + 16px
    ); /* 16 is because of the reduced vertical padding */
  }

  .shipping-address-wrapper {
    height: calc(
      100% - 55px + 20px + 10px
    ); /* add 10 for the reduced padding-bottom */
    padding-bottom: 8px;
  }

  :global(.address-label) {
    font-size: 14px;
  }

  .address-section {
    /* TODO: to replace left/right padding with variable */
    padding: 0px 16px 16px;
  }

  .address-scrollable {
    min-height: 120%;
  }
</style>
