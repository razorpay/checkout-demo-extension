<script>
  // svelte imports
  import { onMount, onDestroy } from 'svelte';

  // UI Imports
  import CTA from 'ui/elements/CTA.svelte';
  import AvailableCouponsButton from './components/AvailableCouponsButton.svelte';
  import ContactWidget from 'one_click_checkout/contact_widget/ContactWidget.svelte';
  import Screen from 'ui/layouts/Screen.svelte';
  import AddressWidget from 'one_click_checkout/coupons/ui/components/AddressWidget.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // store imports
  import { getCurrency, getPrefilledCouponCode } from 'razorpay';
  import {
    checkServiceabilityStatus,
    selectedAddress,
  } from 'one_click_checkout/address/shipping_address/store';
  import {
    appliedCoupon,
    isCouponApplied,
    couponInputValue,
    error,
    couponInputSource,
  } from 'one_click_checkout/coupons/store';
  import {
    isBillingSameAsShipping,
    savedAddresses,
  } from 'one_click_checkout/address/store';
  import {
    cartAmount,
    cartDiscount,
    amount,
    isShippingAddedToAmount,
    shippingCharge,
  } from 'one_click_checkout/charges/store';
  import { removeCouponInStore } from 'one_click_checkout/coupons/store';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    SUMMARY_LABEL,
    TOTAL_LABEL,
    CONTINUE_LABEL,
  } from 'one_click_checkout/coupons/i18n/labels';
  import {
    COUPON_DISCOUNT_LABEL,
    AMOUNT_LABEL,
    SHIPPING_CHARGES_LABEL,
    FREE_LABEL,
  } from 'one_click_checkout/summary_modal/i18n/labels';

  // session imports
  import {
    removeCouponCode,
    showAmountInTopBar,
    hideAmountInTopBar,
  } from 'one_click_checkout/coupons/sessionInterface';
  import { getIcons } from 'one_click_checkout/sessionInterface';
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
  import Razorpay from 'common/Razorpay';
  import {
    fetchCoupons,
    applyCouponCode,
  } from 'one_click_checkout/coupons/helpers';
  import { formatAmountWithSymbol } from 'common/currency';
  import { navigator } from 'one_click_checkout/routing/helpers/routing';
  import { showHeader } from 'one_click_checkout/header/helper';
  import { hideToast } from 'one_click_checkout/Toast';

  // constant imports
  import { views } from 'one_click_checkout/routing/constants';
  import { SERVICEABILITY_STATUS } from 'one_click_checkout/address/constants';

  let showCta = true;
  const currency = getCurrency();
  const prefilledCoupon = getPrefilledCouponCode();
  const { order } = getIcons();

  let ctaDisabled = false;
  $: ctaDisabled = $savedAddresses.length && !$selectedAddress.serviceability;

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

    if (!$savedAddresses.length) {
      navigator.navigateTo({ path: views.ADD_ADDRESS });
    } else {
      if (!$isBillingSameAsShipping) {
        navigator.navigateTo({ path: views.SAVED_BILLING_ADDRESS });
      } else redirectToPaymentMethods();
    }
    showAmountInTopBar();
  }

  function onCouponInput() {
    if ($error) {
      $error = '';
    }

    if ($isCouponApplied) {
      $isCouponApplied = false;
      $appliedCoupon = '';
      $amount = $cartAmount;
    }
  }

  onMount(() => {
    showHeader();
    if (
      $savedAddresses.length &&
      $checkServiceabilityStatus === SERVICEABILITY_STATUS.UNCHECKED
    ) {
      loadAddressesWithServiceability();
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
</script>

<Screen pad={false}>
  <div class="coupon-container">
    <ContactWidget />

    <div class="separator" />
    <AvailableCouponsButton
      applyCoupon={(code) => applyCouponCode(code)}
      removeCoupon={removeCouponCode}
    />

    {#if $savedAddresses.length}
      <AddressWidget
        loading={$checkServiceabilityStatus === SERVICEABILITY_STATUS.LOADING}
        address={$selectedAddress}
        on:headerCtaClick={() =>
          navigator.navigateTo({ path: views.SAVED_ADDRESSES })}
      />
    {/if}

    <div class="coupon-order-summary-label">
      <span class="order-icon"><Icon icon={order} /></span>
      {$t(SUMMARY_LABEL)}
    </div>

    <div class="coupon-order-summary">
      <div class="row justify-between color-gray">
        <p>{$t(AMOUNT_LABEL)}</p>
        <p>
          {formatAmountWithSymbol($cartAmount, currency)}
        </p>
      </div>
      {#if $isCouponApplied && $couponInputValue === $appliedCoupon}
        <div class="row justify-between color-gray">
          <p>
            {$t(COUPON_DISCOUNT_LABEL, { values: { code: $appliedCoupon } })}
          </p>
          <p class="color-green">
            - {formatAmountWithSymbol($cartDiscount, currency)}
          </p>
        </div>
      {/if}
      {#if $isShippingAddedToAmount}
        <div class="row justify-between color-gray">
          <p>{$t(SHIPPING_CHARGES_LABEL)}</p>
          <p>
            {$shippingCharge
              ? formatAmountWithSymbol($shippingCharge, currency)
              : $t(FREE_LABEL)}
          </p>
        </div>
      {/if}
      <hr class="order-split" />
      <div class="row justify-between">
        <p><b>{$t(TOTAL_LABEL)}</b></p>
        <p><b>{formatAmountWithSymbol($amount, currency)}</b></p>
      </div>
    </div>
    {#if showCta}
      <CTA disabled={ctaDisabled} on:click={onSubmit}>{$t(CONTINUE_LABEL)}</CTA>
    {/if}
  </div>
</Screen>

<style>
  .coupon-order-summary-label {
    font-style: normal;
    font-weight: 600;
    font-size: 13px;
    line-height: 16px;
    margin-top: 20px;
    text-transform: capitalize;
    display: flex;
    align-items: center;
    padding: 0px 18px;
  }
  .order-icon {
    margin-right: 8px;
    padding-top: 3px;
  }
  .coupon-container {
    padding-top: 20px;
  }

  .coupon-order-summary {
    margin-bottom: 14px;
    padding: 12px 18px;
    font-size: 14px;
  }
  .row {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #424242;
  }

  p {
    margin-block-start: 0;
    margin-block-end: 0;
  }

  .color-green {
    color: #079f0d;
  }

  .color-gray {
    color: #8d97a1;
  }

  .have-coupon-label {
    font-style: normal;
    font-weight: normal;
    font-size: 13px;
    line-height: 16px;
    text-transform: uppercase;
    margin-bottom: 10px;
    color: rgba(51, 51, 51, 0.6);
  }

  b {
    color: #000000;
    line-height: 17px;
  }

  .order-split {
    border: 1px dashed #8d97a1;
    border-bottom: none;
  }

  .separator {
    height: 10px;
    background-color: #f8fafd;
  }
</style>
