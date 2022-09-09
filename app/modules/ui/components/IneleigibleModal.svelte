<script>
  import { mode } from 'checkoutstore/screens/otp';

  import { payInFull } from 'emiV2/payment/prePaymentHandler';

  import { popStack } from 'navstack';
  import { isRedesignV15 } from 'razorpay';
  import { onMount } from 'svelte';
  import { t } from 'svelte-i18n';

  import { PAY_IN_FULL, TRY_AGAIN } from 'ui/labels/confirm';
  import {
    ENTERED_NUMBER_INELIGIBLE,
    INELIGIBLE_CONTACT_MESSAGE,
  } from 'ui/labels/emi';

  onMount(() => {
    // we need to explicitly set $mode to null in order to avoid
    // emi details being shown in the verify otp for cards screen
    $mode = null;
  });
</script>

<div
  id="ineligble-number-overlay"
  class:ineligble-number-overlay-onecc={isRedesignV15()}
>
  <div class="ineligible-number-header">
    <header>{$t(ENTERED_NUMBER_INELIGIBLE)}</header>
  </div>
  <div class="modal-body">
    <p>{$t(INELIGIBLE_CONTACT_MESSAGE)}</p>
    <div class="button-action-row">
      <div
        role="button"
        class="button btn secondary"
        on:click={() => {
          popStack();
        }}
      >
        {$t(TRY_AGAIN)}
      </div>
      <div role="button" class="button btn" on:click={payInFull}>
        {$t(PAY_IN_FULL)}
      </div>
    </div>
  </div>
</div>

<style>
  #ineligble-number-overlay {
    padding: 20px 16px;
    bottom: -55px;
  }
  .ineligble-number-overlay-onecc {
    bottom: 0 !important;
  }
  .ineligible-number-header {
    margin-bottom: 10px;
  }
  .ineligible-number-header header {
    color: #3f71d7;
    font-size: 14px;
    font-weight: 600;
    text-align: left;
  }
  .modal-body {
    font-size: 14px;
    color: #8d97a1;
    text-align: left;
  }

  .button-action-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .btn {
    border-radius: 0 0 3px 3px;
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    width: 148px;
    border: 1px solid transparent;
    line-height: 40px;
    text-transform: none;
  }

  .btn.secondary {
    background: #fff;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    margin-right: 16px;
  }
</style>
