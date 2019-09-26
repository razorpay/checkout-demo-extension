<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // Utils imports
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { DEFAULT_AUTH_TYPE_RADIO } from 'common/constants';

  // UI imports
  import Radio from 'templates/views/ui/Radio.svelte';

  // Props
  export let card;
  export let debitPin;
  export let plans;
  export let token;
  export let cvvDigits;

  // Computed
  export let attributes;
  export let showOuter;

  const dispatch = createEventDispatcher();

  $: {
    const { issuer: bank, networkCode } = card;

    const attribs = {
      token,
    };

    if (plans) {
      attribs.emi = true;
      attribs.bank = bank;
    }

    if (networkCode === 'maestro') {
      attribs.maestro = true;
    }

    if (debitPin) {
      attribs.pin = true;
    }

    attributes = attribs;
  }

  $: showOuter = card.networkCode === 'maestro' || debitPin || plans;

  function trackAtmRadio(event) {
    Analytics.track('atmpin:flows:change', {
      type: AnalyticsTypes.BEHAV,
      data: {
        default_auth_type: DEFAULT_AUTH_TYPE_RADIO,
        flow: event.target.value || null,
      },
    });
  }
</script>

<div class="saved-card" tabIndex="0" {...attributes}>
  <div class="help up">EMI is not available on this card</div>
  <div class="cardtype" cardtype={card.networkCode} />
  <div class="saved-inner">
    <span class="saved-number">{card.last4}</span>
    <input
      class="saved-cvv cvv-input"
      inputmode="numeric"
      maxlength={cvvDigits}
      pattern={`[0-9]{${cvvDigits}}`}
      placeholder="CVV"
      required
      type="tel" />
  </div>
  {#if showOuter}
    <div class="saved-outer">
      {#if plans}
        <div
          class="emi-plans-info-container emi-plans-trigger"
          data-bank={card.issuer}
          on:click={event => dispatch('viewPlans', event)}>
          <div class="emi-plan-unselected emi-icon-multiple-cards">
            <div class="emi-plans-text">EMI Available</div>
            <div class="emi-plans-action theme-highlight">Pay with EMI</div>
          </div>
          <div class="emi-plan-selected emi-icon-multiple-cards">
            <div class="emi-plans-text" />
            <div class="emi-plans-action theme-highlight">Edit</div>
          </div>
          <input type="hidden" class="emi_duration" />
        </div>
      {/if}

      {#if card.networkCode === 'maestro'}
        <label for={`nocvv-${token}`} class="maestro-cvv">
          <input class="nocvv-checkbox" type="checkbox" id={`nocvv-${token}`} />
          <span class="checkbox" />
          My Maestro Card doesn't have Expiry/CVV
        </label>
      {/if}

      {#if debitPin}
        <div class="elem-wrap flow-selection-container">
          <Radio
            checked={true}
            containerClass="flow"
            id={`flow-3ds-${token}`}
            inputClass="auth_type_radio"
            label="Pay using <strong>OTP / Password </strong>"
            name={`auth_type-${token}`}
            value="c3ds"
            on:change={trackAtmRadio} />
          <Radio
            contaierClass="flow"
            id={`flow-pin-${token}`}
            inputClass="auth_type_radio"
            label="Pay using <strong>ATM PIN</strong>"
            name={`auth_type-${token}`}
            value="pin"
            on:change={trackAtmRadio} />
        </div>
      {/if}
    </div>
  {/if}
</div>
