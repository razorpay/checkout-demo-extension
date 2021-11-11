<script>
  // UI imports
  import AddressTab from 'one_click_checkout/address/ui/components/AddressTab.svelte';
  import { onMount } from 'svelte';
  // Store imports
  import {
    savedAddresses,
    selectedAddressId,
    newUserAddress,
    selectedAddress,
    shouldSaveAddress,
    isBillingSameAsShipping,
    showSavedAddressCta,
  } from 'one_click_checkout/address/store';
  import { isCodForced } from 'one_click_checkout/store';
  // service imports
  import { thirdWatchCodServiceability } from 'one_click_checkout/address/service';

  import { contact } from 'checkoutstore/screens/home';
  // interface imports
  import { redirectToPaymentMethods } from 'one_click_checkout/sessionInterface';

  // helpers imports
  import { saveNewAddress } from 'one_click_checkout/address/helpers';
  import { getCustomer } from 'checkoutframe/customer';
  import { askForOTP } from 'one_click_checkout/common/otp';
  import { views } from 'one_click_checkout/routing/constants';
  import { screensHistory } from 'one_click_checkout/routing/History';
  import { t } from 'svelte-i18n';
  import { SAVED_ADDRESS_CTA_LABEL } from 'one_click_checkout/address/i18n/labels';
  import Icon from 'ui/elements/Icon.svelte';
  import { getTheme } from 'one_click_checkout/sessionInterface';
  import SameBillingAndShipping from 'one_click_checkout/address/ui/components/SameBillingAndShipping.svelte';
  import Analytics, { Events } from 'analytics';
  import AddressEvents from 'one_click_checkout/address/analytics';
  import {
    ADDRESS_TYPES,
    views as addressViews,
  } from 'one_click_checkout/address/constants';
  import Resource from 'one_click_checkout/address/resource';
  import MetaProperties from 'one_click_checkout/analytics/metaProperties';
  import { otpReasons } from 'one_click_checkout/otp/constants';

  // props
  export let currentView;

  let address;

  const { arrow_next } = getTheme().icons;

  let customer = getCustomer($contact, null, true);

  $: isViewAddAddress = routeMap[currentView] === addressViews.ADD_ADDRESS;

  function onSubmit(addressCompleted) {
    if (currentView === views.ADD_ADDRESS) {
      addressCompleted.set(true);
    }

    const shouldNavigateToBilling = !$isBillingSameAsShipping;

    if (shouldNavigateToBilling) {
      screensHistory.push(views.BILLING_ADDRESS);
      return;
    }

    if (!isCodForced()) {
      thirdWatchCodServiceability($selectedAddress).then((res) => {
        if ($selectedAddressId) {
          const newAddresses = $savedAddresses.map((item) => {
            if (item.id === $selectedAddressId && item.cod) {
              item.cod = res.cod;
            }
            return item;
          });
          savedAddresses.set(newAddresses);
        } else {
          $newUserAddress.cod = $newUserAddress.cod && res?.cod;
        }
        postSubmit();
      });
    } else {
      postSubmit();
    }
  }

  function postSubmit() {
    if (
      !$shouldSaveAddress ||
      routeMap[currentView] === addressViews.SAVED_ADDRESSES
    ) {
      redirectToPaymentMethods();
      return;
    }
    if (customer.logged) {
      saveNewAddress().then(() => {
        redirectToPaymentMethods();
      });
    } else {
      askForOTP(otpReasons.saving_address);
    }
  }

  const routeMap = {
    [views.ADD_ADDRESS]: addressViews.ADD_ADDRESS,
    [views.SAVED_ADDRESSES]: addressViews.SAVED_ADDRESSES,
  };

  function onSavedAddressClick() {
    Events.Track(AddressEvents.ACCESS_SAVED_ADDRESS);

    address.currentView.setCurrentView(addressViews.SAVED_ADDRESSES);
    screensHistory.push(
      Resource[ADDRESS_TYPES.SHIPPING_ADDRESS].routes[
        addressViews.SAVED_ADDRESSES
      ]
    );
  }

  onMount(() => {
    Analytics.setMeta(
      MetaProperties.ADDRESS_SCREEN_TYPE,
      ADDRESS_TYPES.SHIPPING_ADDRESS
    );
    Events.Track(AddressEvents.ADDRESS_SCREEN, {
      saved_address_cta_visible:
        $showSavedAddressCta &&
        routeMap[currentView] === addressViews.ADD_ADDRESS,
    });
  });

  function noSavedAddressRedirect() {
    screensHistory.pop(false);
    askForOTP(otpReasons.access_address);
  }

  function trackSameBillingAndShippingCheckbox({ detail }) {
    if (detail.checked) {
      Events.Track(AddressEvents.BILLING_SAME_AS_SHIPPING_CHECKED, {
        address_screen: ADDRESS_TYPES.SHIPPING_ADDRESS,
      });
    } else {
      Events.Track(AddressEvents.BILLING_SAME_AS_SHIPPING_UNCHECKED, {
        address_screen: ADDRESS_TYPES.SHIPPING_ADDRESS,
      });
    }
  }
</script>

<AddressTab
  addressType={ADDRESS_TYPES.SHIPPING_ADDRESS}
  bind:this={address}
  onSubmitCallback={onSubmit}
  currentView={routeMap[currentView]}
  {noSavedAddressRedirect}
>
  <div slot="header">
    {#if $showSavedAddressCta && isViewAddAddress}
      <button
        class="saved-addresses-cta"
        on:click|preventDefault={onSavedAddressClick}
      >
        {$t(SAVED_ADDRESS_CTA_LABEL)}
        <Icon icon={arrow_next} />
      </button>
    {/if}
  </div>
  <div slot="inner-footer">
    {#if isViewAddAddress}
      <SameBillingAndShipping
        shouldSaveAddress={true}
        on:toggle={trackSameBillingAndShippingCheckbox}
      />
    {/if}
  </div>
  <div slot="footer">
    {#if routeMap[currentView] === addressViews.SAVED_ADDRESSES}
      <SameBillingAndShipping
        shouldSaveAddress={false}
        isFixed
        on:toggle={trackSameBillingAndShippingCheckbox}
      />
    {/if}
  </div>
</AddressTab>

<style>
  div[slot='inner-footer'] {
    margin-top: 16px;
  }
</style>
