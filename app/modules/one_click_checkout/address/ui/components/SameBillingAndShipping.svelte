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

  export let disabled = false;
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
  <div
    id="same-address-checkbox-container"
    data-testid="same-billing-address-checkbox"
    class="same-address-checkbox"
    class:checkbox-sticky={isFixed}
    class:checkbox-non-Sticky={!isFixed}
  >
    <Checkbox
      {disabled}
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
    border-top: 1px solid var(--background-color-magic);
    display: inline-flex;
    align-items: center;
    margin-top: 16px;
    font-size: var(--font-size-small);
  }

  .same-address-checkbox > :global(label) {
    min-height: 0;
    max-height: 16px;
  }

  .checkbox-text {
    color: var(--primary-text-color);
  }
  .checkbox-sticky {
    position: absolute;
    bottom: 0;
    width: calc(100% - 18px);
    padding: 12px 0 4px 16px;
  }
  .checkbox-non-Sticky {
    border: none;
  }
</style>
