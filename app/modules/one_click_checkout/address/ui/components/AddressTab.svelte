<script lang="ts">
  // svelte imports
  import { get } from 'svelte/store';

  // UI imports
  import CTA from 'cta';
  import SavedAddresses from 'one_click_checkout/address/ui/components/SavedAddresses.svelte';
  import AddNewAddress from 'one_click_checkout/address/ui/components/AddNewAddress.svelte';
  import AccountTab from 'account_modal/ui/AccountTab.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // i18n imports
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  // analytics imports
  import { Events } from 'analytics';
  import AddressEvents from 'one_click_checkout/address/analytics';
  import { addMoengageUser } from 'one_click_checkout/merchant-analytics/helpers';

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
  import { activeRoute } from 'one_click_checkout/routing/store';
  import { showLoader } from 'one_click_checkout/loader/store';
  import { selectedAddressId as selectedBillingAddressId } from 'one_click_checkout/address/billing_address/store';
  import { shouldOverrideVisibleState } from 'one_click_checkout/header/store';
  import { shippingCharge } from 'one_click_checkout/charges/store';
  import { email } from 'checkoutstore/screens/home';
  import {
    updateMoengageEventsData,
    moengageEventsData,
  } from 'one_click_checkout/merchant-analytics/store';

  // helpers imports
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { navigator } from 'one_click_checkout/routing/helpers/routing';
  import { validateInput } from 'one_click_checkout/address/helpers';
  import {
    merchantAnalytics,
    moengageAnalytics,
  } from 'one_click_checkout/merchant-analytics';
  import {
    formatAddressToFormData,
    showShippingChargeAddedToast,
  } from 'one_click_checkout/address/helpersExtra';
  import { getServiceabilityCache } from 'one_click_checkout/address/service';

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
    MOENGAGE_EVENTS,
  } from 'one_click_checkout/merchant-analytics/constant';
  import { INDIA_COUNTRY_CODE } from 'common/constants';
  import { CTA_LABEL } from 'cta/i18n';
  import { SELECTED_ADDRESS_DOM_ID } from 'one_click_checkout/address/constants';
  import { pushShippingOptionsOverlay } from 'one_click_checkout/shipping_options';

  export let error;
  export let onSubmitCallback;
  export let currentView;
  export let addressType;
  export let showAccBottomSeparator = false;
  let addNewAddressRef;
  let addressWrapperEle;
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

  let disabled: boolean;
  let {
    title,
    store: {
      selectedAddressId,
      addressCompleted,
      shouldSaveAddress,
      newUserAddress,
      selectedCountryISO,
      selectedShippingOption,
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

  function handleEditAddressClick({ detail: address }) {
    Events.TrackBehav(AddressEvents.EDIT_SAVED_ADDRESS_CLICKED);
    selectedAddressId.set(address.id);
    if (address.country) {
      selectedShippingCountryISO.set(address.country);
    }
    newUserAddress.update((addr) => ({
      ...addr,
      ...formatAddressToFormData(address),
    }));
    currentView = addressViews.EDIT_ADDRESS;
    $shouldOverrideVisibleState = false;
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

  const getSelectedAddrIndex = () =>
    addresses?.findIndex(
      (addr) =>
        (addressType === ADDRESS_TYPES.SHIPPING_ADDRESS &&
          addr?.id === $selectedShippingAddressId) ||
        addr?.id === $selectedBillingAddressId
    );

  export function onSubmit() {
    if (ADDRESS_FORM_VIEWS.includes(currentView)) {
      const elementId = Resource[addressType].formId;
      const inpError = validateInput(elementId);
      if (!isFormComplete || inpError) {
        error = inpError;
        error.text = formatTemplateWithLocale(
          error.label?.text,
          { field: error.label?.field },
          $locale
        );
        Events.Track(AddressEvents.ADDRESS_SUBMIT_CLICKED, {
          address_valid: false,
          is_saved_address: false,
          is_billing_same_as_shipping: $isBillingSameAsShipping,
          opted_to_save_address: !!$shouldSaveAddress,
        });
        addNewAddressRef.handleAllInputsBlur();
        return;
      }
      merchantAnalytics({
        event: `addnew_address_${ACTIONS.CTA_CLICKED}`,
        category: CATEGORIES.ADDRESS,
      });
    } else {
      if (!$selectedAddressId) {
        window.alert('Please Select the address');
        return;
      }

      const selectedAddressBox = document.getElementById(
        SELECTED_ADDRESS_DOM_ID
      );
      if (
        addressType === ADDRESS_TYPES.SHIPPING_ADDRESS &&
        selectedAddressBox &&
        !$selectedAddress.serviceability
      ) {
        selectedAddressBox.scrollIntoView({
          behavior: 'smooth',
        });
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
      const selectedAddrIndex = getSelectedAddrIndex();
      Events.TrackBehav(AddressEvents.SAVED_ADDRESS_CONTINUE_CLICKED, {
        count_saved_addresses: addresses?.length,
        address_id:
          addressType === ADDRESS_TYPES.SHIPPING_ADDRESS
            ? $selectedShippingAddressId
            : $selectedBillingAddressId,
        address_position_index: selectedAddrIndex,
        top_shown_address: !selectedAddrIndex,
      });

      let addrUsedEventName = AddressEvents.TOP_SHOWN_SHIPPING_ADDRESS;
      if (addressType === ADDRESS_TYPES.BILLING_ADDRESS) {
        addrUsedEventName = AddressEvents.TOP_SHOWN_BILLING_ADDRESS;
      }
      Events.TrackBehav(addrUsedEventName, {
        top_shown_address: !selectedAddrIndex,
      });

      merchantAnalytics({
        event: `saved_address_${ACTIONS.CTA_CLICKED}`,
        category: CATEGORIES.ADDRESS,
      });
    } else {
      const { name, line1, line2, city, state, zipcode, tag } =
        $selectedAddress;
      Events.TrackBehav(AddressEvents.ADDRESS_SUBMIT_CLICKED_V2, {
        meta: {
          is_user_opted_to_save_address: !!$shouldSaveAddress,
        },
        '1cc_category_of_saved_address': tag,
      });
      const payload = {
        'Full Name': name,
        Email: $email,
        'Full Address': `${line1} ${line2} `,
        City: city,
        State: state,
        PinCode: zipcode,
        'Address Type': tag,
        'Shipping Method': 'standard',
      };
      updateMoengageEventsData(payload);
      moengageAnalytics({
        eventName: MOENGAGE_EVENTS.ADDRESS_ADDED,
        eventData: $moengageEventsData,
      });
    }
    addMoengageUser($selectedAddress?.name);
    const shippingMethods =
      $selectedAddress.shipping_methods ||
      getServiceabilityCache($selectedAddress.zipcode)?.shipping_methods;
    $shouldOverrideVisibleState = false;
    if (
      addressType === ADDRESS_TYPES.SHIPPING_ADDRESS &&
      shippingMethods?.length > 1
    ) {
      pushShippingOptionsOverlay(shippingMethods, () =>
        onSubmitCallback(addressCompleted)
      );
    } else {
      onSubmitCallback(addressCompleted);
    }
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

  function onServiceabilityCheck({ detail: { newCharge } }) {
    if (newCharge === $shippingCharge) {
      return;
    }
    $shippingCharge = newCharge;
    showShippingChargeAddedToast(newCharge);
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

  $: {
    if (ADDRESS_FORM_VIEWS.includes(currentView)) {
      disabled = !isFormComplete || $showLoader;
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
    class:billing-address-wrapper={Resource[addressType].classes[
      'billing-address-wrapper'
    ]}
    bind:this={addressWrapperEle}
  >
    <div class="address-section">
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
          on:serviceabilityCheck={onServiceabilityCheck}
          id={Resource[addressType].formId}
          checkServiceability={Resource[addressType].checkServiceability}
          formData={newUserAddress}
          {error}
          {shouldSaveAddress}
          {addressType}
          {selectedCountryISO}
          {currentView}
          {addressWrapperEle}
          {selectedShippingOption}
          bind:this={addNewAddressRef}
        />
      {/if}
    </div>
  </div>
  <AccountTab showBottomSeparator={showAccBottomSeparator} />
  <slot name="footer" />
  <CTA
    screen="home-1cc"
    tab={$activeRoute?.name}
    disabled={false}
    show
    label={CTA_LABEL}
    variant={disabled ? 'disabled' : ''}
    showAmount
    handleDisableState={false}
    {onSubmit}
  />
</div>

<style>
  * {
    margin: 0px;
    padding: 0px;
    border: 0px;
  }

  .address-wrapper {
    padding-top: 16px;
    min-height: 100%;
  }

  .address-tab {
    height: inherit;
  }

  .label-container {
    display: flex;
    align-items: center;
  }

  .label-text {
    color: var(--primary-text-color);
    font-size: var(--font-size-body);
    text-transform: capitalize;
    margin-left: 8px;
    font-weight: var(--font-weight-semibold);
  }

  .billing-address-wrapper {
    padding: 0;
  }

  :global(.address-label) {
    font-size: var(--font-size-body);
  }

  .address-section {
    /* TODO: to replace left/right padding with variable */
    padding: 0px 16px 16px;
    min-height: 120%;
  }

  .separator {
    border-top: 1px solid #e0e0e0;
    margin-bottom: 12px;
  }

  .address-tab :global(.account-tab .bottom) {
    margin-bottom: 38px;
  }
</style>
