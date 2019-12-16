<script>
  /* global showOverlay */
  // UI Imports
  import NumberField from 'templates/views/ui/fields/card/NumberField.svelte';
  import ExpiryField from 'templates/views/ui/fields/card/ExpiryField.svelte';
  import CvvField from 'templates/views/ui/fields/card/CvvField.svelte';

  // Store
  import {
    cardCvv,
    cardExpiry,
    cardName,
    cardNumber,
    remember,
  } from 'checkoutstore/screens/card';

  // Utils
  import { getSession } from 'sessionmanager';
  import NameField from './ui/fields/card/NameField.svelte';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  const session = getSession();
  let expiryField = null;
  let nameField = null;
  let cvvField = null;

  export let cardType = null;
  let cvvLength = 3;

  function handleCardNetworkChanged(event) {
    cardType = event.detail.type;
  }

  function handleFilled(curField) {
    switch (curField) {
      case 'numberField':
        expiryField.ref.focus();
        break;
      case 'expiryField':
        $cardName ? cvvField.ref.focus() : nameField.ref.focus();
        break;
      default:
        return;
    }
  }

  function showEmiPlans() {
    // TODO: Update showOverlay once session.js is refactored.
    showOverlay({ 0: _Doc.querySelector('#emi-wrap') });

    Analytics.track('emi:plans:view:all', {
      type: AnalyticsTypes.BEHAV,
    });
  }
</script>

<style>
  .row {
    display: flex;
  }

  .two-third {
    width: 66.66%;
  }

  .third {
    margin-left: 20px;
    width: 33.33%;
  }

  .save-checkbox {
    margin-top: 24px;
    justify-content: space-between;
  }

  .flow-selection-container {
    margin: 16px 0 8px 0;
    display: flex;
  }

  .flow-selection-container > * {
    flex-grow: 1;
  }

  .flow-selection-container > label {
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.64);
    font-size: 12px;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }
</style>

<div class="pad" id="add-card-container">
  <div class="row">
    <div class="two-third">
      <NumberField
        bind:value={$cardNumber}
        type={cardType}
        on:network={handleCardNetworkChanged}
        on:filled={_ => handleFilled('numberField')} />
    </div>
    <div class="third">
      <ExpiryField
        bind:value={$cardExpiry}
        bind:this={expiryField}
        on:filled={_ => handleFilled('expiryField')} />
    </div>
  </div>
  <div class="row">
    <div class="two-third">
      <NameField bind:value={$cardName} bind:this={nameField} />
    </div>
    <div class="third">
      <CvvField bind:value={$cardCvv} {cardType} bind:this={cvvField} />
    </div>
  </div>
  <div class="row save-checkbox">
    <div>
      <label for="save" tabIndex="0">
        <input
          type="checkbox"
          class="checkbox--square"
          id="save"
          name="save"
          value="1"
          bind:checked={$remember} />
        <span class="checkbox" />
        Remember Card
      </label>
    </div>
    <div id="view-emi-plans" on:click={showEmiPlans} class="link">
      View all EMI Plans
    </div>
  </div>
  <div class="row">
    <div class="flow-selection-container">
      <label>Complete Payment Using</label>
      <div class="flow input-radio">
        <input
          type="radio"
          name="auth_type"
          id="flow-3ds"
          value="c3ds"
          checked />
        <label for="flow-3ds">
          <div class="radio-display" />
          <div class="label-content">OTP / Password</div>
        </label>
      </div>
      <div class="flow input-radio">
        <input type="radio" name="auth_type" id="flow-pin" value="pin" />
        <label for="flow-pin">
          <div class="radio-display" />
          <div class="label-content">ATM PIN</div>
        </label>
      </div>
    </div>
  </div>
</div>
