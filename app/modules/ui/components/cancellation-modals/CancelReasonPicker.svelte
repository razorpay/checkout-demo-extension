<script>
  import { createEventDispatcher } from 'svelte';

  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  import { t } from 'svelte-i18n';
  import {
    CANCEL_REASON_BACK_ACTION,
    CANCEL_REASON_SUBMIT_ACTION,
  } from 'ui/labels/upi';
  import { isOneClickCheckout } from 'razorpay';

  import { isOneClickCheckout } from 'razorpay';

  export let title = '';
  export let method = '';
  export let reasons = [];

  export let onBack = null;
  export let onSubmit = () => {};

  const dispatch = createEventDispatcher();
  let selectedReason = null;

  const onReasonSelection = (reason) => {
    selectedReason = reason;
  };

  const prefixGenerator = (text) => `${method}-${text}`;

  const isOneClickCheckoutEnabled = isOneClickCheckout();
</script>

<div
  id={'cancel_' + method}
  class="cancel_modal"
  class:modal_one_cc={isOneClickCheckoutEnabled}
>
  <p>{$t(title)}</p>

  {#each reasons as reason, i (reason.value)}
    <label
      on:click={() => onReasonSelection(reason.value)}
      for={prefixGenerator(i)}
    >
      <input
        id={prefixGenerator(i)}
        type="radio"
        name="_[reason]"
        value={reason.value}
      />
      {$t(reason.label)}
    </label>
  {/each}
  <div class="buttons">
    {#if onBack}
      <button class="back-btn" on:click={onBack}>
        <!-- LABEL: Back -->
        {$t(CANCEL_REASON_BACK_ACTION)}
      </button>
    {/if}
    <!-- LABEL: Submit -->
    <button
      class="btn"
      class:btn-one-cc={isOneClickCheckoutEnabled}
      on:click={() => {
        Analytics.track(method + ':cancel_reason_submit', {
          type: AnalyticsTypes.BEHAV,
          data: {
            selectedReason,
          },
        });
        onSubmit(selectedReason);
      }}
    >
      {$t(CANCEL_REASON_SUBMIT_ACTION)}
    </button>
  </div>
</div>

<style>
  .cancel_modal {
    display: none;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: #fff;
    border-radius: inherit;

    p {
      margin: 20px;
      font-weight: bold;
      text-align: left;
    }

    label {
      text-align: left;
      padding: 7px 0 7px 50px;
      display: block;
      position: relative;
    }

    input[type='radio'] {
      display: inline;
      position: absolute;
      left: 20px;
    }

    .buttons {
      margin: 10px 20px 0;
      text-align: right;
    }

    .back-btn {
      margin-right: 20px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: bold;
    }
  }

  /*  1CC Specific classes */
  .btn-one-cc {
    border-radius: 4px;
    font-family: inherit;
    text-transform: capitalize;
  }

  .modal_one_cc > p {
    font-weight: 600;
  }

  .modal_one_cc > label {
    color: #8d97a1;
    font-size: 14px;
    line-height: 20px;
  }
</style>
