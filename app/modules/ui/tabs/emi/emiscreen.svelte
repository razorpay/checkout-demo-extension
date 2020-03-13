<script>
  // Svelte imports
  import { createEventDispatcher, onMount } from 'svelte';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import {
    isNameReadOnly,
    getPrefilledName,
    getPrefilledCardNumber,
  } from 'checkoutstore';

  // Props
  export let emiDuration = '';
  export let emiText = '';

  const session = getSession();
  const dispatch = createEventDispatcher();
  const prefill = {
    'card[number]': getPrefilledCardNumber(),
    name: getPrefilledName(),
  };
  const readonly = {
    name: isNameReadOnly(),
  };

  onMount(() => {
    const emi_el_card = _Doc.querySelector(
      '#form-emi input[name="card[number]"]'
    );

    session.delegator
      .add('card', emi_el_card)
      .on('network', function() {
        const type = this.type;

        // card icon element
        this.el.parentNode
          .querySelector('.cardtype')
          .setAttribute('cardtype', type);
      })
      .on('change', function() {
        let isValid = this.isValid();

        if (this.type !== 'bajaj') {
          isValid = false;
        }

        // set validity classes
        if (isValid) {
          _El.removeClass(this.el.parentNode, 'invalid');
        } else {
          _El.addClass(this.el.parentNode, 'invalid');
        }
      });
  });

  export function setPlan(plan) {
    const { text, duration } = plan;

    emiText = text;
    emiDuration = duration;
  }
</script>

<div class="pad">
  <div id="add-emi-container">
    <input type="hidden" name="emi_duration" bind:value={emiDuration} />
    <div class="clear" />
    <div
      class="strip emi-plans-info-container emi-plans-trigger details-visible"
      on:click={() => dispatch('editplan')}>
      <div class="emi-plan-selected emi-icon-multiple-cards ">
        <div class="emi-plans-text">{emiText}</div>
        <div class="emi-plans-action theme-highlight">Edit</div>
      </div>
    </div>
    <h3>Enter Card Details</h3>
    <div class="card-fields">
      <div class="elem-wrap">
        <div class="elem elem-card">
          <div class="cardtype" />
          <label>Card Number</label>
          <i>&#xe605;</i>
          <span class="help">
            Please enter a valid Bajaj Finserv issued card number
          </span>
          <input
            class="input"
            type="tel"
            name="card[number]"
            autocomplete="off"
            maxlength="19"
            value={prefill['card[number]']} />
        </div>
      </div>
      <div class="elem-wrap" class:readonly={readonly.name}>
        <div class="elem elem-name">
          <span class="help">Please enter name on your card</span>
          <label>Card Holder's Name</label>
          <i>&#xe602;</i>
          <input
            class="input"
            type="text"
            name="card[name]"
            required
            value={prefill.name}
            pattern={"^[a-zA-Z. 0-9'-]{1,100}$"}
            readonly={readonly.name} />
        </div>
      </div>
    </div>
  </div>
</div>
<div class="pad recurring-message">
  <span>&#x2139;</span>
  You need to have a
  <strong>Bajaj Finserv issued card</strong>
  to continue.
</div>
