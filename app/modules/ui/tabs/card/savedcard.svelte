<script>
  // Svelte imports
  import { createEventDispatcher, tick } from 'svelte';

  // Utils imports
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { DEFAULT_AUTH_TYPE_RADIO } from 'common/constants';

  // Store
  import { selectedPlanTextForSavedCard } from 'checkoutstore/emi';

  // UI imports
  import Radio from 'ui/elements/Radio.svelte';
  import CvvField from 'ui/elements/fields/card/CvvField.svelte';

  // Props
  export let card;
  export let debitPin;
  export let plans;
  export let token;
  export let cvvDigits;
  export let selected;
  export let tab;

  // Computed
  let attributes;
  let showOuter;
  let showCvv;

  let noCvvChecked = false;
  let cvvValue = '';
  let authType = debitPin ? 'c3ds' : '';

  // Refs
  let cvvInput;
  let cvvInputFormatter;

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

  $: showCvv = !noCvvChecked && selected;

  function handleAuthRadioChanged(event) {
    trackAtmRadio(event);
    authType = event.target.value;
    const payload = {
      authType,
    };
    dispatch('authtypechange', payload);
  }

  function trackAtmRadio(event) {
    Analytics.track('atmpin:flows:change', {
      type: AnalyticsTypes.BEHAV,
      data: {
        default_auth_type: DEFAULT_AUTH_TYPE_RADIO,
        flow: event.target.value || null,
      },
    });
  }

  function handleClick() {
    const payload = { cvv: cvvValue };

    // Focus on next tick because the CVV field might not have rendered right now.
    tick().then(_ => {
      if (cvvInput) {
        cvvInput.focus();
      }
    });

    if (debitPin) {
      payload.authType = authType;
    }

    dispatch('click', payload);
  }
</script>

<div
  class="saved-card "
  class:checked={selected}
  on:click={handleClick}
  tabIndex="0"
  {...attributes}>
  <div class="help up">EMI is not available on this card</div>
  <div class="cardtype" cardtype={card.networkCode} />
  <div class="saved-inner">
    <div class="saved-number">{card.last4}</div>
    <div class="saved-cvv">
      {#if showCvv}
        <CvvField
          bind:value={cvvValue}
          on:input={_ => dispatch('cvvchange', { cvv: cvvValue })}
          bind:this={cvvInput}
          length={cvvDigits}
          showHelp={false}
          showPlaceholder />
      {/if}
    </div>
  </div>
  {#if showOuter && selected}
    <div class="saved-outer">
      {#if plans}
        <!-- TODO: refactor into separate component -->
        <div
          class="emi-plans-info-container emi-plans-trigger"
          data-bank={card.issuer}
          data-card-type={card.type}
          on:click={event => dispatch('viewPlans', event)}>
          {#if $selectedPlanTextForSavedCard && tab === 'emi'}
            <div class="emi-plan-selected emi-icon-multiple-cards">
              <div class="emi-plans-text">{$selectedPlanTextForSavedCard}</div>
              <div class="emi-plans-action theme-highlight">Edit</div>
            </div>
          {:else if tab !== 'emi'}
            <div class="emi-plan-unselected emi-icon-multiple-cards">
              <div class="emi-plans-text">EMI Available</div>
              <div class="emi-plans-action theme-highlight">Pay with EMI</div>
            </div>
          {/if}
        </div>
      {/if}

      <!-- TODO: handle nocvv for saved cards in getPayload -->
      {#if card.networkCode === 'maestro'}
        <label for={`nocvv-${token}`} class="maestro-cvv">
          <input
            class="nocvv-checkbox"
            type="checkbox"
            id={`nocvv-${token}`}
            bind:checked={noCvvChecked} />
          <span class="checkbox" />
          My Maestro Card doesn't have Expiry/CVV
        </label>
      {/if}

      {#if debitPin}
        <div class="elem-wrap flow-selection-container">
          <Radio
            checked={authType === 'c3ds'}
            containerClass="flow"
            id={`flow-3ds-${token}`}
            inputClass="auth_type_radio"
            label="Pay using <strong>OTP / Password </strong>"
            name={`auth_type-${token}`}
            value="c3ds"
            on:change={handleAuthRadioChanged} />
          <Radio
            contaierClass="flow"
            checked={authType === 'pin'}
            id={`flow-pin-${token}`}
            inputClass="auth_type_radio"
            label="Pay using <strong>ATM PIN</strong>"
            name={`auth_type-${token}`}
            value="pin"
            on:change={handleAuthRadioChanged} />
        </div>
      {/if}
    </div>
  {/if}
</div>
