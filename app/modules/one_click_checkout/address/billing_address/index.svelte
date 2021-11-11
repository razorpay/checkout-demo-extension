<script>
  import AddressTab from 'one_click_checkout/address/ui/components/AddressTab.svelte';
  import { views } from 'one_click_checkout/routing/constants';

  import { contact } from 'checkoutstore/screens/home';
  import { getCustomer } from 'checkoutframe/customer';

  import {
    savedAddresses as savedShippingAddress,
    selectedAddressId as selectedShippingAddressId,
    newUserAddress as newShippingAddress,
    selectedAddress as shippingAddress,
    shouldSaveAddress as shouldSaveShippingAddress,
  } from 'one_click_checkout/address/store';

  import {
    ADDRESS_TYPES,
    views as addressViews,
  } from 'one_click_checkout/address/constants';
  import { shouldSaveAddress as shouldSaveBillingAddress } from 'one_click_checkout/address/billing_address/store';
  import { saveNewAddress } from 'one_click_checkout/address/helpers';
  import { isCodForced } from 'one_click_checkout/store';
  import { thirdWatchCodServiceability } from 'one_click_checkout/address/service';
  import { redirectToPaymentMethods } from 'one_click_checkout/sessionInterface';
  import { askForOTP } from 'one_click_checkout/common/otp';
  import SameBillingAndShipping from 'one_click_checkout/address/ui/components/SameBillingAndShipping.svelte';
  import { screensHistory } from 'one_click_checkout/routing/History';
  import Resource from 'one_click_checkout/address/resource';

  import AddressEvents from 'one_click_checkout/address/analytics';
  import Analytics, { Events } from 'analytics';
  import MetaProperties from 'one_click_checkout/analytics/metaProperties';
  import { onMount } from 'svelte';
  import { otpReasons } from 'one_click_checkout/otp/constants';

  export let currentView;

  let address;

  let customer = getCustomer($contact, null, true);

  const routeMap = {
    [views.ADD_BILLING_ADDRESS]: addressViews.ADD_ADDRESS,
    [views.SAVED_BILLING_ADDRESS]: addressViews.SAVED_ADDRESSES,
  };

  function onSubmit(addressCompleted) {
    if (!isCodForced()) {
      thirdWatchCodServiceability($shippingAddress).then((res) => {
        if ($selectedShippingAddressId) {
          const newAddresses = $savedShippingAddress.map((item) => {
            if (item.id === $selectedShippingAddressId && item.cod) {
              item.cod = res.cod;
            }
            return item;
          });
          savedShippingAddress.set(newAddresses);
        } else {
          $newShippingAddress.cod = $newShippingAddress.cod && res?.cod;
        }
        postSubmit(addressCompleted);
      });
    } else {
      postSubmit(addressCompleted);
    }
  }

  function postSubmit(addressCompleted) {
    if (routeMap[currentView] === addressViews.ADD_ADDRESS) {
      addressCompleted.set(true);
    }
    const shouldSaveAddress =
      $shouldSaveShippingAddress || $shouldSaveBillingAddress;
    if (
      routeMap[currentView] === addressViews.SAVED_ADDRESSES ||
      !shouldSaveAddress
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

  function noSavedAddressRedirect() {
    address.setCurrentView(addressViews.ADD_ADDRESS);
    screensHistory.replace(
      Resource[ADDRESS_TYPES.BILLING_ADDRESS].routes[addressViews.ADD_ADDRESS]
    );
  }

  function onToggleSameBillingAndShippingAddress({ detail }) {
    if (detail.checked) {
      Events.Track(AddressEvents.BILLING_SAME_AS_SHIPPING_CHECKED, {
        address_screen: ADDRESS_TYPES.BILLING_ADDRESS,
      });
      $shouldSaveBillingAddress = false;
      screensHistory.pop();
      const view = screensHistory.peek();
      if (
        view ===
        Resource[ADDRESS_TYPES.BILLING_ADDRESS].routes[
          addressViews.SAVED_ADDRESSES
        ]
      ) {
        screensHistory.pop();
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
  {noSavedAddressRedirect}
>
  <div slot="inner-header">
    <SameBillingAndShipping on:toggle={onToggleSameBillingAndShippingAddress} />
  </div>
</AddressTab>
