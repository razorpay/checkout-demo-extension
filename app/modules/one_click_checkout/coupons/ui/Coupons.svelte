<script lang="ts">
  // svelte imports
  import { onMount, onDestroy } from 'svelte';
  import { fly, slide } from 'svelte/transition';
  import { sineOut } from 'svelte/easing';

  // UI Imports
  import AvailableCouponsButton from 'one_click_checkout/coupons/ui/components/AvailableCouponsButton.svelte';
  import ContactWidget from 'one_click_checkout/contact_widget/ContactWidget.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import AddressWidget from 'one_click_checkout/coupons/ui/components/AddressWidget.svelte';
  import OrderWidget from 'one_click_checkout/coupons/ui/components/OrderWidget.svelte';
  import GstinForm from 'one_click_checkout/gstin/ui/GstinForm.svelte';
  import CTA, { CTAState } from 'cta';
  import ShippingMethods from 'one_click_checkout/coupons/ui/components/ShippingMethods.svelte';
  import TruecallerNotification from 'truecaller/ui/components/TruecallerNotification.svelte';

  // store imports
  import { contact, email, country } from 'checkoutstore/screens/home';
  import { getConsentViewCount } from 'razorpay';
  import {
    selectedAddress,
    selectedAddressId,
    selectedShippingOption,
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
  import { isIndianCustomer } from 'checkoutstore/screens/home';
  import {
    shouldShowCoupons,
    getCouponWidgetExperiment,
    showTruecallerErrorMessage,
  } from 'one_click_checkout/store';
  import { isContactAndEmailValid } from 'one_click_checkout/common/details/store';
  import { shouldOverrideVisibleState } from 'one_click_checkout/header/store';
  import {
    gstIn,
    orderInstruction,
    isGstInValid,
  } from 'one_click_checkout/gstin/store';
  import { customerConsentCheckboxState } from 'one_click_checkout/customer/store';
  import {
    moengageEventsData,
    updateMoengageEventsData,
  } from 'one_click_checkout/merchant-analytics/store';

  // controller imports
  import { update as updateContactStorage } from 'checkoutframe/contact-storage';
  import { validateEmail } from 'one_click_checkout/common/validators/email';

  // session imports
  import { removeCouponCode } from 'one_click_checkout/coupons/sessionInterface';
  import { redirectToPaymentMethods } from 'one_click_checkout/sessionInterface';

  // analytics imports
  import Analytics, { Events } from 'analytics';
  import CouponEvents from 'one_click_checkout/coupons/analytics';
  import MetaProperties from 'one_click_checkout/analytics/metaProperties';
  import {
    merchantAnalytics,
    moengageAnalytics,
  } from 'one_click_checkout/merchant-analytics';
  import {
    CATEGORIES,
    ACTIONS,
    MOENGAGE_EVENTS,
  } from 'one_click_checkout/merchant-analytics/constant';

  // utils imports
  import {
    fetchCoupons,
    onSubmitLogoutUser,
  } from 'one_click_checkout/coupons/helpers';
  import { getElementById } from 'utils/doc';
  import { navigator } from 'one_click_checkout/routing/helpers/routing';
  import { toggleHeader } from 'one_click_checkout/header/helper';
  import { hideToast } from 'one_click_checkout/Toast';
  import { getAnimationOptions } from 'svelte-utils';
  import { isUserLoggedIn } from 'one_click_checkout/common/helpers/customer';
  import { getPhoneNumberRegex } from 'one_click_checkout/helper';
  import { updateOrderWithCustomerDetails } from 'one_click_checkout/order/controller';
  import {
    getPrefilledContact,
    getPrefilledEmail,
  } from 'checkoutframe/customer';
  import {
    initSummaryMetaAnalytics,
    handleGSTIN,
  } from 'one_click_checkout/coupons/controller';

  // service imports
  import { updateCustomerConsent } from 'one_click_checkout/customer/controller';

  // constant imports
  import { views } from 'one_click_checkout/routing/constants';
  import { activeRoute } from 'one_click_checkout/routing/store';
  import { CTA_LABEL } from 'cta/i18n';
  import { DELIVERY_ADDRESS_WIDGET_DOM_ID } from 'one_click_checkout/coupons/constants';
  import { isMagicShopifyFlow } from 'checkoutframe/helper';

  const showCoupons = shouldShowCoupons();
  const couponsWidgetExperiment = getCouponWidgetExperiment();

  let ctaDisabled = false;
  let orderWidget;
  let showValidations = $contact || $email;
  let couponsPromise: void | Promise<void>;

  $: ctaDisabled =
    ($savedAddresses.length && !$selectedAddress?.serviceability) ||
    !$isContactAndEmailValid ||
    !$isGstInValid;

  function onSubmitLoggedInUser() {
    updateCustomerConsent($customerConsentCheckboxState);
    const addressWidget = getElementById(DELIVERY_ADDRESS_WIDGET_DOM_ID);
    if (!$selectedAddress?.serviceability && addressWidget) {
      addressWidget.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

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

  function onSubmitUser() {
    updateContactStorage({
      contact: $contact,
      email: $email,
    });
    if (!isUserLoggedIn() && $isIndianCustomer) {
      updateOrderWithCustomerDetails();
      onSubmitLogoutUser();
    } else {
      onSubmitLoggedInUser();
    }
  }

  function handleOnSubmit() {
    const phoneNumberRegex = getPhoneNumberRegex($country);
    if (!phoneNumberRegex.test($contact)) {
      showValidations = true;
      return;
    }

    validateEmail($email).then((valid: boolean) => {
      if (valid) {
        Analytics.setMeta(MetaProperties.IS_COUPON_APPLIED, $isCouponApplied);
        Analytics.setMeta(MetaProperties.APPLIED_COUPON_CODE, $appliedCoupon);
        Events.TrackBehav(CouponEvents.SUMMARY_CONTINUE_CTA_CLICKED, {
          coupon_code_applied: $appliedCoupon,
          address_id: $selectedAddressId,
          address_country: $selectedAddress?.country,
          gstin_filled: !!$gstIn,
          instruction_filled: !!$orderInstruction,
          shipping_title_selected: $selectedShippingOption?.name ?? '',
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

        handleGSTIN(onSubmitUser);

        $shouldOverrideVisibleState = false;
        return;
      }
      showValidations = true;
    });
  }

  function summaryLoadedEvent() {
    initSummaryMetaAnalytics();

    Analytics.setMeta(
      '1cc_zero_coupon_move_experiment',
      $availableCoupons?.length > 0 ? null : couponsWidgetExperiment ? 'B' : 'A'
    );

    Analytics.setMeta('count_coupons_available', $availableCoupons?.length);

    Events.TrackRender(CouponEvents.SUMMARY_SCREEN_LOADED, {
      is_CTA_enabled: !ctaDisabled,
      prefill_contact_number: getPrefilledContact(),
      prefill_email: getPrefilledEmail(),
      count_coupons_available: $availableCoupons.length,
      pre_selected_saved_address_id: $selectedAddressId,
    });

    Events.TrackRender(CouponEvents.SUMMARY_SELECTED_SAVED_ADDRESS, {
      pre_selected_saved_address_id: $selectedAddressId,
    });

    Events.TrackRender(CouponEvents.SUMMARY_BILLING_SAME_AS_SHIPPING, {
      checked_billing_address_same_as_delivery_address:
        $isBillingSameAsShipping,
    });

    if ($selectedAddressId !== null) {
      const {
        name,
        formattedLine1,
        formattedLine2,
        formattedLine3,
        city,
        state,
        zipcode,
        tag,
      } = $selectedAddress;
      const payload = {
        'Full Name': name,
        Email: $email,
        'Full Address': `${formattedLine1} ${formattedLine2} ${formattedLine3}`,
        City: city,
        State: state,
        PinCode: zipcode,
        'Address Type': tag,
        'Shipping Method': 'standard',
      };
      updateMoengageEventsData(payload);
      moengageAnalytics({
        eventName: MOENGAGE_EVENTS.ADDRESS_SELECTED,
        eventData: $moengageEventsData,
      });
    }
  }

  onMount(() => {
    $consentViewCount = $consentViewCount || getConsentViewCount();
    toggleHeader(true);
    updateOrderWithCustomerDetails();
    const promiseList = [];
    couponsPromise = fetchCoupons();
    if (couponsPromise) {
      promiseList.push(couponsPromise);
    }

    merchantAnalytics({
      event: ACTIONS.PAGE_VIEW,
      category: CATEGORIES.COUPONS,
      params: {
        page_title: CATEGORIES.COUPONS,
      },
    });

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
    updateCustomerConsent($customerConsentCheckboxState);
    navigator.navigateTo({ path: views.SAVED_ADDRESSES });
  }

  const couponAnimation = getAnimationOptions({
    duration: 500,
    easing: sineOut,
    x: -100,
    delay: 350,
  });

  /**
   * resets the variable to false when screen is destroyed to
   * ensure that once it has been displayed, it doesn't appear again
   */
  onDestroy(() => {
    if ($showTruecallerErrorMessage) {
      $showTruecallerErrorMessage = false;
    }
  });
</script>

<Screen pad={false}>
  <div data-test-id="summary-screen" class="coupon-container">
    {#if $showTruecallerErrorMessage}
      <TruecallerNotification />
    {/if}
    <div class="widget-wrapper">
      <ContactWidget {showValidations} />
    </div>
    <div class="separator" />

    {#if $savedAddresses.length}
      <div class="widget-wrapper">
        <AddressWidget on:headerCtaClick={onAddressHeaderClick} />
      </div>
      <div class="separator" />
    {/if}

    {#if $savedAddresses?.length && $selectedAddress?.shipping_methods?.length > 1}
      <div class="widget-wrapper" in:slide|local={{ duration: 500 }}>
        <ShippingMethods options={$selectedAddress.shipping_methods} />
      </div>
      <div class="separator" />
    {/if}

    <!-- Coupons Widget if experiment is false -->
    {#if showCoupons && !couponsWidgetExperiment}
      <div class="widget-wrapper">
        <AvailableCouponsButton removeCoupon={removeCouponCode} />
      </div>
      <div class="separator" />
    {/if}

    <!-- Coupons Widget if merchant coupons are available and experiment is true -->
    {#if showCoupons && couponsWidgetExperiment && $availableCoupons.length > 0}
      {#await couponsPromise then _}
        <div
          in:slide={getAnimationOptions({ duration: 350 })}
          class="coupon-animation-container"
        >
          <div class="widget-wrapper" in:fly={couponAnimation}>
            <AvailableCouponsButton removeCoupon={removeCouponCode} />
          </div>
          <div class="separator" />
        </div>
      {/await}
    {/if}

    <div class="widget-wrapper" id="order-widget" bind:this={orderWidget}>
      <OrderWidget />
    </div>
    <GstinForm />

    <!-- Coupons Widget if merchant coupons are not available  and experiment is true -->
    {#if showCoupons && couponsWidgetExperiment && $availableCoupons.length <= 0}
      {#await couponsPromise then _}
        <div
          in:slide={getAnimationOptions({ duration: 350 })}
          class="coupon-animation-container"
        >
          <div class="separator" />
          <div class="widget-wrapper" in:fly={couponAnimation}>
            <AvailableCouponsButton removeCoupon={removeCouponCode} />
          </div>
        </div>
      {/await}
    {/if}
  </div>
  <CTA
    screen="home-1cc"
    tab={$activeRoute?.name}
    disabled={false}
    show
    variant={ctaDisabled ? 'disabled' : ''}
    showAmount
    label={CTA_LABEL}
    onSubmit={handleOnSubmit}
    {onViewDetailsClick}
  />
</Screen>

<style>
  .separator {
    height: 8px;
    background-color: var(--background-color-magic);
  }

  .widget-wrapper {
    padding: 14px 16px;
    background-color: #fff;
  }

  .coupon-container {
    min-height: 100%;
  }
  .coupon-animation-container {
    background-color: var(--background-color-magic);
  }

  #order-widget {
    padding-bottom: 14px;
  }
</style>
