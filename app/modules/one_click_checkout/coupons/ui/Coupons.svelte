<script>
  // svelte imports
  import { onMount } from 'svelte';

  // UI Imports
  import CTA from 'ui/elements/CTA.svelte';
  import AvailableCouponsButton from './components/AvailableCouponsButton.svelte';
  import CouponInput from './components/CouponInput.svelte';
  import UserDetailsStrip from 'ui/components/UserDetailsStrip.svelte';
  import Screen from 'ui/layouts/Screen.svelte';

  // store imports
  import { getCurrency, getPrefilledCouponCode } from 'razorpay';
  import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
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
  import { savedAddresses } from 'one_click_checkout/address/store';
  import {
    cartAmount,
    cartDiscount,
    amount,
  } from 'one_click_checkout/charges/store';
  import { removeCouponInStore } from 'one_click_checkout/coupons/store';

  // i18n imports
  import { t } from 'svelte-i18n';
  import {
    SUMMARY_LABEL,
    TOTAL_LABEL,
    HAVE_COUPON_LABEL,
    CONTINUE_LABEL,
  } from 'one_click_checkout/coupons/i18n/labels';
  import {
    COUPON_DISCOUNT_LABEL,
    AMOUNT_LABEL,
  } from 'one_click_checkout/summary_modal/i18n/labels';

  // session imports
  import {
    showDetailsOverlay,
    removeCouponCode,
    showAmountInTopBar,
    hideAmountInTopBar,
  } from 'one_click_checkout/coupons/sessionInterface';
  import { loadAddressesWithServiceability } from 'one_click_checkout/address/sessionInterface';

  // analytics imports
  import Razorpay from 'common/Razorpay';
  import Analytics, { Events } from 'analytics';
  import CouponEvents from 'one_click_checkout/coupons/analytics';
  import MetaProperties from 'one_click_checkout/analytics/metaProperties';
  import {
    CATEGORIES,
    ACTIONS,
  } from 'one_click_checkout/merchant-analytics/constant';

  // utils imports
  import {
    fetchCoupons,
    applyCouponCode,
  } from 'one_click_checkout/coupons/helpers';
  import { formatAmountWithSymbol } from 'common/currency';
  import { navigator } from 'one_click_checkout/routing/helpers/routing';

  // constant imports
  import { views } from 'one_click_checkout/routing/constants';
  import { SERVICEABILITY_STATUS } from 'one_click_checkout/address/constants';

  let showCta = true;
  const currency = getCurrency();
  const prefilledCoupon = getPrefilledCouponCode();

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
    navigator.navigateTo({ path: views.SAVED_ADDRESSES });
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

  function onEdit() {
    Razorpay.sendMessage({
      event: 'event',
      data: {
        event: 'user_details.edit',
      },
    });
    showDetailsOverlay();
  }

  onMount(() => {
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
</script>

<Screen pad={false}>
  <div class="coupon-container">
    <UserDetailsStrip {onEdit} />
    <p class="have-coupon-label">{$t(HAVE_COUPON_LABEL)}</p>

    <CouponInput
      {onCouponInput}
      applyCoupon={() => applyCouponCode()}
      removeCoupon={removeCouponCode}
    />

    <AvailableCouponsButton
      applyCoupon={(code) => applyCouponCode(code)}
      removeCoupon={removeCouponCode}
    />

    <p class="coupon-order-summary-label">{$t(SUMMARY_LABEL)}</p>

    <div class="coupon-order-summary">
      <div class="row justify-between">
        <p>{$t(AMOUNT_LABEL)}</p>
        <p>
          {formatAmountWithSymbol($cartAmount, currency)}
        </p>
      </div>
      {#if $isCouponApplied && $couponInputValue === $appliedCoupon}
        <div class="row justify-between">
          <p>
            {$t(COUPON_DISCOUNT_LABEL, { values: { code: $appliedCoupon } })}
          </p>
          <p class="color-green">
            {formatAmountWithSymbol($cartDiscount, currency)}
          </p>
        </div>
      {/if}
      <hr />
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
    font-weight: normal;
    font-size: 13px;
    line-height: 16px;
    margin-top: 20px;
    text-transform: uppercase;
    color: rgba(51, 51, 51, 0.6);
  }
  .coupon-container {
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 20px;
  }

  .coupon-order-summary {
    margin-top: 14px;
    margin-bottom: 14px;
    padding: 12px 14px;
    background: #f7f7f7;
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

  hr {
    opacity: 0.1;
    border: 1px solid #000000;
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
</style>
