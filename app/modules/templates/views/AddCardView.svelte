<script>
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
      case 'expiryField':
        $cardName ? cvvField.ref.focus() : nameField.ref.focus();
      default:
        return;
    }
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
      <!-- TODO: pass type -->
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
      <!-- TODO: pass type -->
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
    <div id="view-emi-plans" class="link">View all EMI Plans</div>
  </div>
</div>
