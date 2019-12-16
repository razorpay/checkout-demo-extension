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
  } from 'checkoutstore/screens/card';

  // Utils
  import { getSession } from 'sessionmanager';
  import NameField from './ui/fields/card/NameField.svelte';

  const session = getSession();

  export let cardType = null;
  let cvvLength = 3;

  function handleCardNetworkChanged(event) {
    cardType = event.detail.type;
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
  }
</style>

<div class="pad" id="add-card-container">
  <div class="row">
    <div class="two-third">
      <NumberField
        bind:value={$cardNumber}
        type={cardType}
        on:network={handleCardNetworkChanged} />
    </div>
    <div class="third">
      <!-- TODO: pass type -->
      <ExpiryField bind:value={$cardExpiry} />
    </div>
  </div>
  <div class="row">
    <div class="two-third">
      <NameField bind:value={$cardName} />
    </div>
    <div class="third">
      <!-- TODO: pass type -->
      <CvvField bind:value={$cardCvv} {cardType} />
    </div>
  </div>
  <div class="row save-checkbox">
    <label class="first" id="should-save-card" for="save" tabIndex="0">
      <input
        type="checkbox"
        class="checkbox--square"
        id="save"
        name="save"
        value="1" />
      <span class="checkbox" />
      Remember Card
    </label>
  </div>
</div>
