<script>
  import { onMount } from 'svelte';

  // UI imports
  import Icon from 'ui/elements/Icon.svelte';
  import {
    showToast,
    TOAST_SCREEN,
    TOAST_THEME,
  } from 'one_click_checkout/Toast';
  import AddressTab from 'one_click_checkout/address/ui/components/AddressTab.svelte';
  import SameBillingAndShipping from 'one_click_checkout/address/ui/components/SameBillingAndShipping.svelte';

  // Store imports
  import {
    newUserAddress,
    shouldSaveAddress,
    showSavedAddressCta,
  } from 'one_click_checkout/address/shipping_address/store';
  import { isBillingSameAsShipping } from 'one_click_checkout/address/store';
  import { contact } from 'checkoutstore/screens/home';
  import { shippingCharge } from 'one_click_checkout/charges/store';

  // interface imports
  import {
    getIcons,
    redirectToPaymentMethods,
  } from 'one_click_checkout/sessionInterface';

  // helpers imports
  import { saveAddress } from 'one_click_checkout/address/helpers';
  import { getCustomer } from 'checkoutframe/customer';
  import { askForOTP } from 'one_click_checkout/common/otp';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  import {
    SAVED_ADDRESS_CTA_LABEL,
    SHIPPING_CHARGES_LABEL,
  } from 'one_click_checkout/address/i18n/labels';

  // Analytics imports
  import Analytics, { Events } from 'analytics';
  import AddressEvents from 'one_click_checkout/address/analytics';
  import {
    ADDRESS_FORM_VIEWS,
    ADDRESS_TYPES,
    views as addressViews,
  } from 'one_click_checkout/address/constants';
  import MetaProperties from 'one_click_checkout/analytics/metaProperties';

  import Resource from 'one_click_checkout/address/resource';
  import { views } from 'one_click_checkout/routing/constants';
  import { otpReasons } from 'one_click_checkout/otp/constants';
  import { navigator } from 'one_click_checkout/routing/helpers/routing';
  import { formatAmountWithSymbol } from 'common/currency';
  import { getCurrency } from 'razorpay';

  // props
  export let currentView;

  let address;

  const { caret_circle_right } = getIcons();

  let customer = getCustomer($contact, null, true);

  function onSubmit(addressCompleted) {
    if (ADDRESS_FORM_VIEWS.includes(currentView)) {
      addressCompleted.set(true);
    }

    const shouldNavigateToBilling = !$isBillingSameAsShipping;

    if (shouldNavigateToBilling) {
      navigator.navigateTo({ path: views.SAVED_BILLING_ADDRESS });
      return;
    }
    postSubmit();
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
      saveAddress().then((res) => {
        $newUserAddress.id = res.shipping_address?.id;
        redirectToPaymentMethods();
      });
    } else {
      askForOTP(otpReasons.saving_address);
    }
  }

  const routeMap = {
    [views.ADD_ADDRESS]: addressViews.ADD_ADDRESS,
    [views.SAVED_ADDRESSES]: addressViews.SAVED_ADDRESSES,
    [views.EDIT_ADDRESS]: addressViews.EDIT_ADDRESS,
  };

  function onSavedAddressClick() {
    Events.Track(AddressEvents.ACCESS_SAVED_ADDRESS);

    address.setCurrentView(addressViews.SAVED_ADDRESSES);
    navigator.navigateTo({
      path: Resource[ADDRESS_TYPES.SHIPPING_ADDRESS].routes[
        addressViews.SAVED_ADDRESSES
      ],
    });
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

  $: {
    if ($shippingCharge) {
      showToast({
        screen: TOAST_SCREEN.ONE_CC,
        theme: TOAST_THEME.INFO,
        message: formatTemplateWithLocale(SHIPPING_CHARGES_LABEL, {
          charge: formatAmountWithSymbol($shippingCharge, getCurrency()),
        }),
      });
    }
  }
</script>

<AddressTab
  addressType={ADDRESS_TYPES.SHIPPING_ADDRESS}
  bind:this={address}
  onSubmitCallback={onSubmit}
  currentView={routeMap[currentView]}
>
  <div slot="header">
    {#if $showSavedAddressCta && routeMap[currentView] === addressViews.ADD_ADDRESS}
      <button
        class="saved-addresses-cta"
        on:click|preventDefault={onSavedAddressClick}
      >
        <span class="saved-addresses-cta__text">
          {$t(SAVED_ADDRESS_CTA_LABEL)}
        </span>
        <Icon icon={caret_circle_right} />
      </button>
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
  * {
    box-sizing: border-box;
    padding: 0px;
    margin: 0px;
  }

  .saved-addresses-cta {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 12px 16px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .saved-addresses-cta__text {
    color: var(--background-color);
    font-weight: bold;
    font-size: 14px;
  }

  .saved-addresses-cta {
    color: var(--highlight-color);
    font-weight: bold;
    border: 1px solid #e6e7e8;
    padding: 10px 12px;
    width: 100%;
    margin-bottom: 14px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
