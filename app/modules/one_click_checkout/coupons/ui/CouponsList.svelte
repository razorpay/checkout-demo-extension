<script>
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
  } from 'one_click_checkout/coupons/store';
  import { cartAmount, amount } from 'one_click_checkout/charges/store';

  // Coupons imports
  import { removeCouponCode } from 'one_click_checkout/coupons/sessionInterface';

  // utils imports
  import { applyCouponCode } from 'one_click_checkout/coupons/helpers';
  import { toggleHeader } from 'one_click_checkout/header/helper';
  import { hideCta } from 'checkoutstore/cta';

  onMount(() => {
    hideCta();
    toggleHeader(false);
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
  b {
    color: #000000;
    line-height: 18px;
  }
  .separator {
    height: 10px;
    background-color: #f8fafd;
  }
  .coupon-input-container {
    padding: 24px 16px 22px;
  }
</style>
