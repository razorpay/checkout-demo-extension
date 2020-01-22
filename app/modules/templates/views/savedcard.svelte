<script>
  // Svelte imports
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  // Utils imports
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { DEFAULT_AUTH_TYPE_RADIO } from 'common/constants';
  import { getSession } from 'sessionmanager';

  // Store
  import { selectedPlanTextForSavedCard } from 'checkoutstore/emi';

  // UI imports
  import Radio from 'templates/views/ui/Radio.svelte';

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

  let noCvvChecked = false;
  let cvvValue = '';
  let authType = debitPin ? 'c3ds' : '';

  const session = getSession();

  // Refs
  let cvvInput;
  let cvvInputFormatter;

  onMount(() => {
    if (cvvInput) {
      cvvInputFormatter = session.delegator.add('number', cvvInput);
    }
  });

  onDestroy(() => {
    if (cvvInputFormatter) {
      cvvInputFormatter.unbind();
    }
  });

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
    if (cvvInput) {
      cvvInput.focus();
    }
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
    <span class="saved-number">{card.last4}</span>
    <input
      class="saved-cvv cvv-input"
      class:hidden={noCvvChecked}
      inputmode="numeric"
      maxlength={cvvDigits}
      pattern={`[0-9]{${cvvDigits}}`}
      bind:this={cvvInput}
      placeholder="CVV"
      required
      on:input={_ => dispatch('cvvchange', { cvv: cvvValue })}
      bind:value={cvvValue}
      type="tel" />
  </div>
  {#if showOuter && selected}
    <div class="saved-outer">
      {#if plans}
        <!-- TODO: refactor into separate component -->
        <div
          class="emi-plans-info-container emi-plans-trigger"
          data-bank={card.issuer}
          on:click={event => dispatch('viewPlans', event)}>
          {#if $selectedPlanTextForSavedCard && tab === 'emi'}
            <div class="emi-plan-selected emi-icon-multiple-cards">
              <div class="emi-plans-text">{$selectedPlanTextForSavedCard}</div>
              <div class="emi-plans-action theme-highlight">Edit</div>
            </div>
          {:else}
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
            checked={true}
            containerClass="flow"
            id={`flow-3ds-${token}`}
            inputClass="auth_type_radio"
            label="Pay using <strong>OTP / Password </strong>"
            name={`auth_type-${token}`}
            value="c3ds"
            on:change={handleAuthRadioChanged} />
          <Radio
            contaierClass="flow"
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
