<script>
  /* global showOverlay, gel, Event */

  // UI Imports
  import NumberField from 'templates/views/ui/fields/card/NumberField.svelte';
  import ExpiryField from 'templates/views/ui/fields/card/ExpiryField.svelte';
  import CvvField from 'templates/views/ui/fields/card/CvvField.svelte';
  import CardFlowSelectionRadio from 'templates/views/ui/CardFlowSelectionRadio.svelte';
  import NameField from 'templates/views/ui/fields/card/NameField.svelte';

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

  import { selectedPlanTextForNewCard } from 'checkoutstore/emi';

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

  const nameReadonly =
    session.get('readonly.name') && session.get('prefill.name');

  const showRememberCardCheck = !session.recurring;

  let noCvvChecked = false;
  let showNoCvvCheckbox = false;
  let hideExpiryCvvFields = false;

  $: {
    if ($cardType) {
      showNoCvvCheckbox = $cardType === 'maestro' && $cardNumber.length > 5;
    }
  }

  $: {
    hideExpiryCvvFields = showNoCvvCheckbox && noCvvChecked;
  }

  export let showEmiCta = false;
  export let emiCtaView = '';
  export let savedCount = 0;
  export let tab;

  let showAuthTypeSelectionRadio = false;
  let showDebitPinRadio = false;

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
    if ($remember) {
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

    showDebitPinRadio = Boolean(visible);
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
      $cardType,
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

  function handleEmiCtaClick(e) {
    let eventName = 'emi:plans:';
    const eventData = {
      from: session.tab,
    };

    session.removeAndCleanupOffers();

    if (emiCtaView === 'available') {
      session.showEmiPlans('new')(e);
      eventName += 'view';
    } else if (emiCtaView === 'plans-available') {
      session.showEmiPlans('new')(e);
      eventName += 'edit';
    } else if (emiCtaView === 'pay-without-emi') {
      if (session.methods.card) {
        session.setScreen('card');
        session.switchTab('card');
        session.offers && session.renderOffers(session.tab);

        eventName = 'emi:pay_without';
      }
    } else if (emiCtaView === 'plans-unavailable') {
      if (session.methods.card) {
        session.setScreen('card');
        session.switchTab('card');
        session.offers && session.renderOffers(session.tab);

        eventName = 'emi:pay_without';
      }
    }

    Analytics.track(eventName, {
      type: AnalyticsTypes.BEHAV,
      data: eventData,
    });
  }

  function handleCardInput() {
    onCardNumberChange();
    dispatch('cardinput');
  }

  function getEmiBanksList() {
    const { banks = {} } = session.emi_options || {};
    const bankList = _Obj.entries(banks).map(([_, bank]) => bank.name);
    return bankList.join(', ');
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
        on:input={handleCardInput} />
    </div>
    {#if !hideExpiryCvvFields}
      <div class="third">
        <ExpiryField
          id="card_expiry"
          bind:value={$cardExpiry}
          bind:this={expiryField}
          on:filled={_ => handleFilled('expiryField')} />
      </div>
    {/if}
  </div>
  <div class="row card-fields">
    <div class="two-third">
      <NameField
        id="card_name"
        name="card[name]"
        bind:value={$cardName}
        bind:this={nameField}
        readonly={nameReadonly} />
    </div>
    {#if !hideExpiryCvvFields}
      <div class="third">
        <CvvField
          id="card_cvv"
          bind:value={$cardCvv}
          cardType={$cardType}
          bind:this={cvvField} />
      </div>
    {/if}
  </div>
  <div class="row remember-check">

    <div>
      {#if showRememberCardCheck}
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
      {/if}
    </div>
    {#if tab === 'emi'}
      <div id="view-emi-plans" on:click={showEmiPlans} class="link">
        View all EMI Plans
      </div>
    {/if}
  </div>
  {#if showEmiCta}
    <div id="elem-emi">
      <div
        class="strip emi-plans-info-container emi-plans-trigger"
        on:click={handleEmiCtaClick}>
        {#if emiCtaView === 'plans-unavailable'}
          <div class="emi-plan-unavailable emi-icon-multiple-cards">
            <span class="help">
              EMI is available on {getEmiBanksList()} cards. Enter your credit
              card to avail.
            </span>
            <div class="emi-plans-text">EMI unavailable</div>
            {#if session.methods.card}
              <div class="emi-plans-action theme-highlight">
                Pay entire amount
              </div>
            {/if}
          </div>
        {/if}
        {#if emiCtaView === 'plans-available'}
          <div class="emi-plan-selected emi-icon-multiple-cards">
            <div class="emi-plans-text">{$selectedPlanTextForNewCard}</div>
            <div class="emi-plans-action theme-highlight">Edit</div>
          </div>
        {/if}
        {#if emiCtaView === 'available'}
          <div class="emi-plan-unselected emi-icon-multiple-cards">
            <div class="emi-plans-text">EMI Available</div>
            <div class="emi-plans-action theme-highlight">Pay with EMI</div>
          </div>
        {/if}
        {#if emiCtaView === 'pay-without-emi'}
          <div class="emi-pay-without emi-icon-single-card">
            <div class="emi-plans-text no-action">
              Pay entire amount
              {#if savedCount}
                <span class="count-text">( {savedCount} cards available )</span>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
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
