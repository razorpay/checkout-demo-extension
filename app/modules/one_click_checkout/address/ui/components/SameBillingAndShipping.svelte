<script lang="ts">
  // svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import Checkbox from 'ui/elements/Checkbox.svelte';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { SAME_ADDRESS_LABEL } from 'one_click_checkout/address/i18n/labels';

  // store imports
  import { isBillingSameAsShipping } from 'one_click_checkout/address/store';
  import { shouldSaveAddress as shouldSaveBillingAddress } from 'one_click_checkout/address/billing_address/store';

  // utils imports
  import { isBillingAddressEnabled } from 'razorpay';

  export let isFixed = false;
  export let shouldSaveAddress = false;

  const dispatch = createEventDispatcher();

  function onChange() {
    $isBillingSameAsShipping = !$isBillingSameAsShipping;
    $shouldSaveBillingAddress = shouldSaveAddress;

    dispatch('toggle', {
      checked: $isBillingSameAsShipping,
    });
  }
</script>

{#if isBillingAddressEnabled()}
  <div class="same-address-checkbox" class:checkbox-sticky={isFixed}>
    <Checkbox
      on:change={onChange}
      checked={$isBillingSameAsShipping}
      id="same-address-checkbox"
    />
    <span class="checkbox-text">{$t(SAME_ADDRESS_LABEL)}</span>
  </div>
{/if}

<style>
  .same-address-checkbox {
    background: white;
    display: inline-flex;
    margin-top: 12px;
    font-size: 13px;
  }

  .checkbox-text {
    color: #263a4a;
  }
  .checkbox-sticky {
    position: absolute;
    bottom: 0;
    width: calc(100% - 24px);
    padding: 12px 0 4px 16px;
  }
</style>
