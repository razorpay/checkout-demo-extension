<script>
  /* global showOverlay, gel, Event */

  // UI Imports
  import NumberField from 'ui/elements/fields/card/NumberField.svelte';
  import ExpiryField from 'ui/elements/fields/card/ExpiryField.svelte';
  import CvvField from 'ui/elements/fields/card/CvvField.svelte';
  import CardFlowSelectionRadio from 'ui/elements/CardFlowSelectionRadio.svelte';
  import NameField from 'ui/elements/fields/card/NameField.svelte';

  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // Store
  import {
    cardCvv,
    cardExpiry,
    cardName,
    cardNumber,
    remember,
    authType,
    cardType,
  } from 'checkoutstore/screens/card';

  import CheckoutStore from 'checkoutstore';

  // Utils
  import { getSession } from 'sessionmanager';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { getIin, getCardDigits } from 'common/card';
  import { DEFAULT_AUTH_TYPE_RADIO } from 'common/constants';
  import { Formatter } from 'formatter';

  const session = getSession();
  const dispatch = createEventDispatcher();

  let numberField = null;
  let expiryField = null;
  let nameField = null;
  let cvvField = null;

  const nameReadonly = CheckoutStore.get().readonly.name;

  const isSavedCardsEnabled = session.get('remember_customer');

  const showRememberCardCheck = !session.recurring && isSavedCardsEnabled;

  let noCvvChecked = false;
  let showNoCvvCheckbox = false;
  let hideExpiryCvvFields = false;
  let cvvLength = 3;

  $: {
    if ($cardType) {
      showNoCvvCheckbox = $cardType === 'maestro' && $cardNumber.length > 5;
    }
  }

  $: {
    hideExpiryCvvFields = showNoCvvCheckbox && noCvvChecked;
  }

  $: {
    cvvLength = getCvvDigits($cardType);
  }

  export let tab;

  let showAuthTypeSelectionRadio = false;

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

  export function getPayload() {
    const payload = {
      'card[number]': $cardNumber.replace(/ /g, ''),
      'card[expiry]': $cardExpiry,
      'card[cvv]': $cardCvv,
      'card[name]': $cardName,
    };
    // Fill in dummy values for expiry and CVV if the CVV and expiry fields are hidden
    if (hideExpiryCvvFields) {
      payload['card[expiry]'] = '12 / 21';
      payload['card[cvv]'] = '000';
    }
    if ($remember && isSavedCardsEnabled) {
      payload.save = 1;
    }
    if (showAuthTypeSelectionRadio) {
      payload.auth_type = $authType;
    }
    return payload;
  }

  function setDebitPinRadiosVisibility(visible) {
    if (visible) {
      $authType = DEFAULT_AUTH_TYPE_RADIO;
    }

    showAuthTypeSelectionRadio = Boolean(visible);
  }

  const Flows = {
    PIN: 'pin',
    OTP: 'otp',
    RECURRING: 'recurring',
  };

  /**
   * @param {Object} flows
   * @param {String} flow
   *
   * @return {Boolean}
   */
  const isFlowApplicable = _.curry2((flows, flow) => Boolean(flows[flow]));

  /**
   * Validate the card number.
   * @return {Boolean}
   */
  export function validateCardNumber() {
    const cardNumberWithoutSpaces = getCardDigits($cardNumber);

    let isValid = Formatter.rules.card.isValid.call({
      value: cardNumberWithoutSpaces,
      type: $cardType,
    });

    if (!session.preferences.methods.amex && $cardType === 'amex') {
      isValid = false;
    }

    return isValid;
  }

  /**
   * Checks and performs actions related to card flows
   * and validate the card input.
   */
  function onCardNumberChange() {
    const value = $cardNumber;
    const cardNumber = getCardDigits(value);
    const iin = getIin(cardNumber);

    const isStrictlyRecurring =
      session.recurring && session.get('recurring') !== 'preferred';

    let isValid = validateCardNumber();
    numberField.setValid(isValid);

    const flowChecker = (flows = {}) => {
      const cardNumber = getCardDigits(value);
      const isIinSame = getIin(cardNumber) === iin;

      // If the card number was changed before response, do nothing
      if (!isIinSame) {
        return;
      }

      if (isStrictlyRecurring) {
        isValid = isValid && isFlowApplicable(flows, Flows.RECURRING);
      } else {
        // Debit-PIN is not supposed to work in case of recurring
        if (isFlowApplicable(flows, Flows.PIN)) {
          setDebitPinRadiosVisibility(true);
        } else {
          setDebitPinRadiosVisibility(false);
        }
      }

      numberField.setValid(isValid);
    };

    if (iin.length < 6) {
      setDebitPinRadiosVisibility(false);
    }

    if (iin.length >= 6) {
      session.r.getCardFlows(iin, flowChecker);
    }
  }

  function handleCardInput() {
    onCardNumberChange();
    dispatch('cardinput');
  }

  function getCvvDigits(type) {
    return type === 'amex' ? 4 : 3;
  }

  function trackRememberChecked(event) {
    Analytics.track('card:save:change', {
      type: AnalyticsTypes.BEHAV,
      data: {
        active: event.target.checked,
      },
    });
  }

  function trackCardNumberFilled() {
    Analytics.track('card_number:filled', {
      type: AnalyticsTypes.BEHAV,
      data: {
        valid: numberField.isValid(),
      },
    });
  }

  function trackCvvFilled() {
    Analytics.track('card_cvv:filled', {
      type: AnalyticsTypes.BEHAV,
      data: {
        valid: cvvField.isValid(),
      },
    });
  }

  function trackExpiryFilled() {
    Analytics.track('card_expiry:filled', {
      type: AnalyticsTypes.BEHAV,
      data: {
        valid: expiryField.isValid(),
      },
    });
  }

  function trackNameFilled() {
    Analytics.track('card_name:filled', {
      type: AnalyticsTypes.BEHAV,
      data: {
        valid: nameField.isValid(),
      },
    });
  }
</script>

<style>
  .row {
    display: flex;
    margin-top: 12px;
    margin-bottom: 12px;
  }

  .row.card-fields {
    margin-top: 0;
    margin-bottom: 0;
  }

  .remember-check {
    justify-content: space-between;
    margin-top: 20px;
  }

  .two-third {
    width: 66.66%;
    flex-grow: 1;
  }

  .third {
    box-sizing: border-box;
    padding-left: 20px;
    width: 33.33%;
  }
</style>

<div class="pad" id="add-card-container">
  <div class="row card-fields">
    <div class="two-third">
      <NumberField
        id="card_number"
        bind:value={$cardNumber}
        bind:this={numberField}
        type={$cardType}
        on:filled={_ => handleFilled('numberField')}
        on:input={handleCardInput}
        on:blur={trackCardNumberFilled} />
    </div>
    {#if !hideExpiryCvvFields}
      <div class="third">
        <ExpiryField
          id="card_expiry"
          name="card[expiry]"
          bind:value={$cardExpiry}
          bind:this={expiryField}
          on:blur={trackExpiryFilled}
          on:filled={_ => handleFilled('expiryField')} />
      </div>
    {/if}
  </div>
  <div class="row card-fields">
    <div class="two-third">
      <NameField
        id="card_name"
        name="card[name]"
        readonly={nameReadonly}
        bind:value={$cardName}
        bind:this={nameField}
        on:blur={trackNameFilled} />
    </div>
    {#if !hideExpiryCvvFields}
      <div class="third">
        <CvvField
          id="card_cvv"
          length={cvvLength}
          bind:value={$cardCvv}
          bind:this={cvvField}
          on:blur={trackCvvFilled} />
      </div>
    {/if}
  </div>
  <div class="row remember-check">

    <div>
      {#if showRememberCardCheck}
        <label class="first" for="save" id="should-save-card" tabIndex="0">
          <input
            type="checkbox"
            class="checkbox--square"
            id="save"
            name="save"
            value="1"
            on:change={trackRememberChecked}
            bind:checked={$remember} />
          <span class="checkbox" />
          Remember Card
        </label>
      {/if}
    </div>
    {#if tab === 'emi'}
      <div id="view-emi-plans" on:click={showEmiPlans} class="link">
        View all EMI Plans
      </div>
    {/if}
  </div>
  {#if showNoCvvCheckbox}
    <div class="row">
      <label id="nocvv-check" for="nocvv">
        <input
          type="checkbox"
          class="checkbox--square"
          id="nocvv"
          bind:checked={noCvvChecked} />
        <span class="checkbox" />
        My Maestro Card doesn't have Expiry/CVV
      </label>
    </div>
  {/if}
  {#if showAuthTypeSelectionRadio}
    <div class="row">
      <CardFlowSelectionRadio bind:value={$authType} />
    </div>
  {/if}
</div>
