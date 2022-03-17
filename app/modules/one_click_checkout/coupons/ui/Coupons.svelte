<script>
  // svelte imports
  import { onMount, onDestroy } from 'svelte';

  // UI Imports
  import AvailableCouponsButton from 'one_click_checkout/coupons/ui/components/AvailableCouponsButton.svelte';
  import ContactWidget from 'one_click_checkout/contact_widget/ContactWidget.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import AddressWidget from 'one_click_checkout/coupons/ui/components/AddressWidget.svelte';
  import OrderWidget from 'one_click_checkout/coupons/ui/components/OrderWidget.svelte';
  import CTA from 'one_click_checkout/cta/index.svelte';

  // store imports
  import { contact, email } from 'checkoutstore/screens/home';
  import {
    getPrefilledCouponCode,
    isContactHidden,
    isEmailHidden,
  } from 'razorpay';
  import {
    checkServiceabilityStatus,
    selectedAddress,
  } from 'one_click_checkout/address/shipping_address/store';
  import {
    appliedCoupon,
    isCouponApplied,
    couponInputSource,
  } from 'one_click_checkout/coupons/store';
  import {
    isBillingSameAsShipping,
    savedAddresses,
  } from 'one_click_checkout/address/store';
  import { isShippingAddedToAmount } from 'one_click_checkout/charges/store';
  import { removeCouponInStore } from 'one_click_checkout/coupons/store';
  import { isIndianCustomer } from 'checkoutstore';

  // i18n imports
  import { ADDRESS_LABEL } from 'one_click_checkout/topbar/i18n/label';

  // session imports
  import {
    removeCouponCode,
    showAmountInTopBar,
    hideAmountInTopBar,
  } from 'one_click_checkout/coupons/sessionInterface';
  import { loadAddressesWithServiceability } from 'one_click_checkout/address/sessionInterface';
  import { redirectToPaymentMethods } from 'one_click_checkout/sessionInterface';

  // analytics imports
  import Analytics, { Events } from 'analytics';
  import CouponEvents from 'one_click_checkout/coupons/analytics';
  import MetaProperties from 'one_click_checkout/analytics/metaProperties';
  import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
  import {
    CATEGORIES,
    ACTIONS,
  } from 'one_click_checkout/merchant-analytics/constant';

  // utils imports
  import {
    fetchCoupons,
    applyCouponCode,
  } from 'one_click_checkout/coupons/helpers';
  import { navigator } from 'one_click_checkout/routing/helpers/routing';
  import { toggleHeader } from 'one_click_checkout/header/helper';
  import { hideToast } from 'one_click_checkout/Toast';
  import { removeTabInBreadcrumbs } from 'one_click_checkout/topbar/helper';
  import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';

  // constant imports
  import { views } from 'one_click_checkout/routing/constants';
  import { SERVICEABILITY_STATUS } from 'one_click_checkout/address/constants';

  const prefilledCoupon = getPrefilledCouponCode();

  let ctaDisabled = false;

  $: ctaDisabled =
    (!$contact && !isContactHidden()) ||
    (!$email && !isEmailHidden()) ||
    ($savedAddresses.length && !$selectedAddress.serviceability);

  function onSubmit() {
    Analytics.setMeta(MetaProperties.IS_COUPON_APPLIED, $isCouponApplied);
    Analytics.setMeta(MetaProperties.APPLIED_COUPON_CODE, $appliedCoupon);
    Events.Track(CouponEvents.COUPONS_SUBMIT, {
      input_source: $couponInputSource,
    });

    merchantAnalytics({
      event: `${$isCouponApplied ? 'with' : 'without'}_coupons_${
        ACTIONS.CTA_CLICKED
      }`,
      category: CATEGORIES.COUPONS,
      params: {
        page_title: CATEGORIES.COUPONS,
      },
    });
    if (!$isCouponApplied) {
      removeCouponInStore();
    }

    if (!isUserLoggedIn() && $isIndianCustomer) {
      navigator.navigateTo({ path: views.SAVED_ADDRESSES });
    } else if (!$savedAddresses.length) {
      navigator.navigateTo({ path: views.ADD_ADDRESS });
    } else {
      if (!$isBillingSameAsShipping) {
        navigator.navigateTo({ path: views.SAVED_BILLING_ADDRESS });
      } else redirectToPaymentMethods();
    }
    showAmountInTopBar();
  }

  onMount(() => {
    toggleHeader(true);
    if ($savedAddresses?.length) {
      removeTabInBreadcrumbs(ADDRESS_LABEL);
      if ($checkServiceabilityStatus === SERVICEABILITY_STATUS.UNCHECKED) {
        loadAddressesWithServiceability();
      }
      $isShippingAddedToAmount = true;
    }
    merchantAnalytics({
      event: ACTIONS.PAGE_VIEW,
      category: CATEGORIES.COUPONS,
      params: {
        page_title: CATEGORIES.COUPONS,
      },
    });
    hideAmountInTopBar();
    fetchCoupons();
    if (prefilledCoupon) {
      applyCouponCode(prefilledCoupon);
    }
  });

  onDestroy(() => {
    hideToast();
  });

  function onViewDetailsClick() {
    document.getElementById('order-widget').scrollIntoView();
  }
</script>

<Screen pad={false}>
  <div class="coupon-container">
    <div class="widget-wrapper">
      <ContactWidget />
    </div>
    <div class="separator" />

    {#if $savedAddresses.length}
      <div class="widget-wrapper">
        <AddressWidget
          loading={$checkServiceabilityStatus === SERVICEABILITY_STATUS.LOADING}
          address={$selectedAddress}
          on:headerCtaClick={() =>
            navigator.navigateTo({ path: views.SAVED_ADDRESSES })}
        />
      </div>
      <div class="separator" />
    {/if}

    <div class="widget-wrapper">
      <AvailableCouponsButton
        applyCoupon={(code) => applyCouponCode(code)}
        removeCoupon={removeCouponCode}
      />
    </div>
    <div class="separator" />

    <div class="widget-wrapper" id="order-widget">
      <OrderWidget />
    </div>
    <CTA on:click={onSubmit} {onViewDetailsClick} disabled={ctaDisabled} />
  </div>
</Screen>

<style>
  .separator {
    height: 10px;
    background-color: #f8fafd;
  }

  .widget-wrapper {
    padding: 28px 16px;
  }
</style>
