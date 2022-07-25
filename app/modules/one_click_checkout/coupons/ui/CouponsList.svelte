<script lang="ts">
  // svelte imports
  import { onMount } from 'svelte';

  // UI Imports
  import CouponInput from 'one_click_checkout/coupons/ui/components/CouponInput.svelte';
  import AvailableCoupons from 'one_click_checkout/coupons/ui/AvailableCoupons.svelte';
  import Screen from 'ui/layouts/Screen.svelte';

  // store imports
  import {
    appliedCoupon,
    isCouponApplied,
    error,
    availableCoupons,
    couponListTimer,
  } from 'one_click_checkout/coupons/store';
  import { cartAmount, amount } from 'one_click_checkout/charges/store';

  // Coupons imports
  import { removeCouponCode } from 'one_click_checkout/coupons/sessionInterface';

  // utils imports
  import {
    applyCouponCode,
    fetchCoupons,
  } from 'one_click_checkout/coupons/helpers';
  import { toggleHeader } from 'one_click_checkout/header/helper';
  import { hideCta } from 'checkoutstore/cta';
  import { timer } from 'utils/timer';

  // analytics imports
  import { Events } from 'analytics';
  import CouponEvents from 'one_click_checkout/coupons/analytics';

  onMount(() => {
    fetchCoupons();
    hideCta();
    toggleHeader(false);
    Events.TrackRender(CouponEvents.COUPON_SCREEN_LOADED, {
      count_coupons_available: $availableCoupons?.length,
    });
    $couponListTimer = timer();
  });

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
</script>

<Screen pad={false} removeAccountTab={true}>
  <div class="coupon-container">
    <div class="coupon-input-container">
      <CouponInput
        {onCouponInput}
        applyCoupon={() => applyCouponCode()}
        removeCoupon={removeCouponCode}
      />
    </div>
    <div class="separator" />
    <AvailableCoupons
      applyCoupon={applyCouponCode}
      removeCoupon={removeCouponCode}
    />
  </div>
</Screen>

<style>
  .separator {
    height: 10px;
    background-color: #f8fafd;
  }
  .coupon-input-container {
    padding: 24px 16px 22px;
  }
</style>
