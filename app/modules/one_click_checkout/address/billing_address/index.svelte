<script>
  // svelte imports
  import { onMount } from 'svelte';

  // UI Imports
  import AddressTab from 'one_click_checkout/address/ui/components/AddressTab.svelte';
  import SameBillingAndShipping from 'one_click_checkout/address/ui/components/SameBillingAndShipping.svelte';

  // Store imports
  import { contact } from 'checkoutstore/screens/home';
  import { getCustomer } from 'checkoutframe/customer';
  import {
    newUserAddress as newShippingAddress,
    shouldSaveAddress as shouldSaveShippingAddress,
    addressCompleted as shippingAddressComplete,
  } from 'one_click_checkout/address/shipping_address/store';
  import { shouldSaveAddress as shouldSaveBillingAddress } from 'one_click_checkout/address/billing_address/store';

  // Constant imports
  import { views } from 'one_click_checkout/routing/constants';
  import { otpReasons } from 'one_click_checkout/otp/constants';
  import {
    ADDRESS_TYPES,
    views as addressViews,
  } from 'one_click_checkout/address/constants';

  // Analytics imports
  import AddressEvents from 'one_click_checkout/address/analytics';
  import Analytics, { Events } from 'analytics';
  import MetaProperties from 'one_click_checkout/analytics/metaProperties';

  // Utility/Service imports
  import { saveNewAddress } from 'one_click_checkout/address/helpers';
  import { redirectToPaymentMethods } from 'one_click_checkout/sessionInterface';
  import { askForOTP } from 'one_click_checkout/common/otp';
  import Resource from 'one_click_checkout/address/resource';
  import { navigator } from 'one_click_checkout/routing/helpers/routing';

  export let currentView;

  let address;
  let customer = getCustomer($contact, null, true);

  const routeMap = {
    [views.ADD_BILLING_ADDRESS]: addressViews.ADD_ADDRESS,
    [views.SAVED_BILLING_ADDRESS]: addressViews.SAVED_ADDRESSES,
  };

  function onSubmit(addressCompleted) {
    if (routeMap[currentView] === addressViews.ADD_ADDRESS) {
      addressCompleted.set(true);
    }
    const shouldSaveAddress =
      $shouldSaveShippingAddress || $shouldSaveBillingAddress;
    if (
      !shippingAddressComplete &&
      (routeMap[currentView] === addressViews.SAVED_ADDRESSES ||
        !shouldSaveAddress)
    ) {
      redirectToPaymentMethods();
      return;
    }
    if (customer.logged) {
      saveNewAddress().then((res) => {
        $newShippingAddress.id = res.shipping_address?.id;
        redirectToPaymentMethods();
      });
    } else {
      askForOTP(otpReasons.saving_address);
    }
  }

  function onToggleSameBillingAndShippingAddress({ detail }) {
    if (detail.checked) {
      Events.Track(AddressEvents.BILLING_SAME_AS_SHIPPING_CHECKED, {
        address_screen: ADDRESS_TYPES.BILLING_ADDRESS,
      });
      $shouldSaveBillingAddress = false;
      navigator.navigateBack();
      const view = navigator.currentActiveRoute.name;
      if (
        view ===
        Resource[ADDRESS_TYPES.BILLING_ADDRESS].routes[
          addressViews.SAVED_ADDRESSES
        ]
      ) {
        navigator.navigateBack();
      }
    } else {
      Events.Track(AddressEvents.BILLING_SAME_AS_SHIPPING_UNCHECKED, {
        address_screen: ADDRESS_TYPES.BILLING_ADDRESS,
      });
    }
  }

  onMount(() => {
    Analytics.setMeta(
      MetaProperties.ADDRESS_SCREEN_TYPE,
      ADDRESS_TYPES.BILLING_ADDRESS
    );
    Events.Track(AddressEvents.ADDRESS_SCREEN);
  });
</script>

<AddressTab
  addressType={ADDRESS_TYPES.BILLING_ADDRESS}
  bind:this={address}
  onSubmitCallback={onSubmit}
  currentView={routeMap[currentView]}
>
  <div slot="inner-header">
    <SameBillingAndShipping on:toggle={onToggleSameBillingAndShippingAddress} />
  </div>
</AddressTab>
