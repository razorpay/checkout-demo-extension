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
    isCodEnabled,
    getConsentViewCount,
  } from 'razorpay';
  import {
    checkServiceabilityStatus,
    selectedAddress,
    selectedAddressId,
  } from 'one_click_checkout/address/shipping_address/store';
  import {
    appliedCoupon,
    isCouponApplied,
    couponInputSource,
    availableCoupons,
  } from 'one_click_checkout/coupons/store';
  import {
    isBillingSameAsShipping,
    savedAddresses,
    consentViewCount,
  } from 'one_click_checkout/address/store';
  import { isIndianCustomer } from 'checkoutstore';
  import {
    shouldShowCoupons,
    isCodForced,
    isLoginMandatory,
  } from 'one_click_checkout/store';
  import { RTBExperiment } from 'rtb/store';

  // i18n imports
  import { locale } from 'svelte-i18n';

  // session imports
  import { removeCouponCode } from 'one_click_checkout/coupons/sessionInterface';
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
    onSubmitLogoutUser,
  } from 'one_click_checkout/coupons/helpers';
  import { navigator } from 'one_click_checkout/routing/helpers/routing';
  import { toggleHeader } from 'one_click_checkout/header/helper';
  import { hideToast } from 'one_click_checkout/Toast';
  import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';
  import { isUnscrollable } from 'one_click_checkout/helper';
  import { isRTBEnabled } from 'rtb/helper';
  import { updateOrderWithCustomerDetails } from 'one_click_checkout/order/controller';
  import {
    getPrefilledContact,
    getPrefilledEmail,
  } from 'checkoutframe/customer';

  // constant imports
  import { views } from 'one_click_checkout/routing/constants';
  import { SERVICEABILITY_STATUS } from 'one_click_checkout/address/constants';
  import { CONTACT_REGEX } from 'common/constants';
  import { isEmailValid } from 'one_click_checkout/common/validators/email';

  const prefilledCoupon = getPrefilledCouponCode();
  const showCoupons = shouldShowCoupons();

  let ctaDisabled = false;
  let couponEle;
  let scrollable = false;
  let orderWidget;
  let showValidations = false;

  $: ctaDisabled =
    (!$contact && !isContactHidden()) ||
    (!$email && !isEmailHidden()) ||
    ($savedAddresses.length && !$selectedAddress?.serviceability);

  function onSubmitLoggedInUser() {
    if (!$savedAddresses.length) {
      navigator.navigateTo({ path: views.ADD_ADDRESS });
    } else {
      if (!$isBillingSameAsShipping) {
        navigator.navigateTo({ path: views.SAVED_BILLING_ADDRESS });
      } else {
        redirectToPaymentMethods();
      }
    }
  }

  function handleOnSubmit() {
    if (!CONTACT_REGEX.test($contact)) {
      showValidations = true;
      return;
    }

    isEmailValid($email).then((valid) => {
      if (valid) {
        Analytics.setMeta(MetaProperties.IS_COUPON_APPLIED, $isCouponApplied);
        Analytics.setMeta(MetaProperties.APPLIED_COUPON_CODE, $appliedCoupon);
        Events.TrackBehav(CouponEvents.SUMMARY_CONTINUE_CTA_CLICKED, {
          coupon_code_applied: $appliedCoupon,
          address_id: $selectedAddressId,
          address_country: $selectedAddress?.country,
          meta: {
            is_saved_address: !!$savedAddresses?.length,
          },
        });
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

        updateOrderWithCustomerDetails();
        if (!isUserLoggedIn() && $isIndianCustomer) {
          onSubmitLogoutUser();
        } else {
          onSubmitLoggedInUser();
        }
        return;
      }
      showValidations = true;
    });
  }

  function summaryLoadedEvent() {
    Analytics.setMeta('is_RTB_live_on_merchant', isRTBEnabled($RTBExperiment));
    Analytics.setMeta('is_force_cod_enabled', isCodForced());
    Analytics.setMeta('is_mandatory_signup_enabled', isLoginMandatory());
    Analytics.setMeta('is_coupons_enabled', showCoupons);
    Analytics.setMeta('is_thirdwatch_insured', !isCodForced());
    Analytics.setMeta('summary_screen_default_language', $locale);
    Analytics.setMeta('is_cod_enabled', isCodEnabled());

    Events.TrackRender(CouponEvents.SUMMARY_SCREEN_LOADED, {
      is_CTA_enabled: !ctaDisabled,
      prefill_contact_number: getPrefilledContact(),
      prefill_email: getPrefilledEmail(),
      count_coupons_available: $availableCoupons.length,
      pre_selected_saved_address_id: $selectedAddressId,
    });
  }

  function checkAddressServiceability() {
    return new Promise((resolve, reject) => {
      if (
        $savedAddresses?.length &&
        $checkServiceabilityStatus === SERVICEABILITY_STATUS.UNCHECKED
      ) {
        loadAddressesWithServiceability().then(resolve).catch(reject);
        return;
      }
      resolve();
    });
  }

  function setScrollable() {
    scrollable = isUnscrollable(couponEle?.parentNode);
  }

  onMount(() => {
    $consentViewCount = $consentViewCount || getConsentViewCount();
    setScrollable();
    toggleHeader(true);
    updateOrderWithCustomerDetails();
    const addressPromise = checkAddressServiceability();
    const promiseList = [addressPromise];
    if (showCoupons) {
      const couponsPromise = fetchCoupons();
      promiseList.push(couponsPromise);
    }
    addressPromise.then(() => {
      Events.TrackRender(CouponEvents.SUMMARY_SELECTED_SAVED_ADDRESS, {
        pre_selected_saved_address_id: $selectedAddressId,
      });
      Events.TrackRender(CouponEvents.SUMMARY_BILLING_SAME_AS_SHIPPING, {
        checked_billing_address_same_as_delivery_address:
          $isBillingSameAsShipping,
      });
    });
    merchantAnalytics({
      event: ACTIONS.PAGE_VIEW,
      category: CATEGORIES.COUPONS,
      params: {
        page_title: CATEGORIES.COUPONS,
      },
    });
    if (prefilledCoupon) {
      applyCouponCode(prefilledCoupon);
    }
    Promise.all(promiseList).finally(summaryLoadedEvent);
  });

  onDestroy(() => {
    hideToast();
  });

  function onViewDetailsClick() {
    if (orderWidget) {
      orderWidget.scrollIntoView();
    }
  }

  function onAddressHeaderClick() {
    navigator.navigateTo({ path: views.SAVED_ADDRESSES });
  }
</script>

<Screen pad={false}>
  <div
    data-test-id="summary-screen"
    class="coupon-container"
    bind:this={couponEle}
    class:coupon-scrollable={scrollable}
  >
    <div class="widget-wrapper contact-wrapper">
      <ContactWidget {showValidations} />
    </div>
    <div class="separator" />

    {#if $savedAddresses.length}
      <div class="widget-wrapper">
        <AddressWidget
          loading={$checkServiceabilityStatus === SERVICEABILITY_STATUS.LOADING}
          address={$selectedAddress}
          on:headerCtaClick={onAddressHeaderClick}
        />
      </div>
      <div class="separator" />
    {/if}

    {#if showCoupons}
      <div class="widget-wrapper">
        <AvailableCouponsButton removeCoupon={removeCouponCode} />
      </div>
      <div class="separator" />
    {/if}
    <div
      class="widget-wrapper order-summary-wrapper"
      id="order-widget"
      bind:this={orderWidget}
    >
      <OrderWidget on:toggleItems={setScrollable} />
    </div>
    <div class="separator" />
    <CTA
      on:click={handleOnSubmit}
      {onViewDetailsClick}
      disabled={ctaDisabled}
      handleDisable
    />
  </div>
</Screen>

<style>
  .separator {
    height: 10px;
    background-color: #f8fafd;
  }

  .widget-wrapper {
    padding: 20px 16px;
  }

  .contact-wrapper {
    padding-top: 26px;
  }

  .order-summary-wrapper {
    padding-bottom: 26px;
  }

  .coupon-scrollable {
    min-height: 110%;
  }
</style>
