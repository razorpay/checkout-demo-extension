<script>
  /* global showOverlay, gel, Event */

  // UI Imports
  import NumberField from 'ui/elements/fields/card/NumberField.svelte';
  import ExpiryField from 'ui/elements/fields/card/ExpiryField.svelte';
  import CvvField from 'ui/elements/fields/card/CvvField.svelte';
  import CardFlowSelectionRadio from 'ui/elements/CardFlowSelectionRadio.svelte';
  import NameField from 'ui/elements/fields/card/NameField.svelte';
  import DowntimeCallout from 'ui/elements/Downtime/Callout.svelte';
  import { returnAsIs } from 'lib/utils';

  import { getSession } from 'sessionmanager';
  // Svelte imports
  import { createEventDispatcher, onMount } from 'svelte';

  // Store
  import {
    cardCvv,
    cardExpiry,
    cardName,
    cardNumber,
    remember,
    authType,
    cardType,
    cardIin,
    showNoCvvCheckbox,
    noCvvChecked,
    hideExpiryCvvFields,
    showAuthTypeSelectionRadio,
  } from 'checkoutstore/screens/card';

  import { methodInstrument } from 'checkoutstore/screens/home';

  import {
    isNameReadOnly,
    shouldRememberCustomer,
    isRecurring,
    isStrictlyRecurring,
    getCardFeatures,
    getRecurringMethods,
    isOfferForced,
  } from 'checkoutstore';
  import {
    isAMEXEnabled,
    getCardNetworks,
    getCardNetworksForRecurring,
    isMethodEnabled,
  } from 'checkoutstore/methods';

  // i18n
  import { t } from 'svelte-i18n';

  import {
    NOCVV_LABEL,
    VIEW_ALL_EMI_PLANS,
    REMEMBER_CARD_LABEL,
    CARD_NUMBER_HELP_UNSUPPORTED,
    ADD_NEW_CARD,
  } from 'card/i18n/labels';

  // Utils
  import Analytics, { CardEvents, Events } from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import {
    getIin,
    getCardDigits,
    getCardMetadata,
    API_NETWORK_CODES_MAP,
  } from 'common/card';
  import { DEFAULT_AUTH_TYPE_RADIO } from 'common/constants';
  import { Formatter } from 'formatter';
  import { isInstrumentValidForPayment } from 'configurability/validate';
  import { isCardValidForOffer } from 'checkoutstore/offers';

  const dispatch = createEventDispatcher();

  let numberField = null;
  let expiryField = null;
  let nameField = null;
  let cvvField = null;
  const nameReadonly = isNameReadOnly();
  export let downtimeVisible;
  export let downtimeSeverity;
  export let downtimeInstrument;
  const isSavedCardsEnabled = shouldRememberCustomer();

  const showRememberCardCheck = isSavedCardsEnabled;

  let cvvLength = 3;
  let showCardUnsupported = false;
  let lastIin = '';

  let cardNumberHelpText;
  $: cardNumberHelpText =
    showCardUnsupported && $cardNumber.length > 6
      ? $t(CARD_NUMBER_HELP_UNSUPPORTED)
      : undefined;

  export let faded = false;

  let validCardForOffer = true;
  $: {
    if (!$isCardValidForOffer && isOfferForced()) {
      validCardForOffer = false;
      setCardNumberValidity(false);
    } else {
      validCardForOffer = true;
    }
  }

  onMount(() => {
    Events.TrackBehav(CardEvents.ADD_NEW_CARD);
  });

  function setCardNumberValidity(valid) {
    let isValid = valid;
    if (!validCardForOffer) {
      isValid = false;
    }
    if (numberField) {
      numberField.setValid(isValid);
      numberField.dispatchFilledIfValid();
    }
  }

  $: {
    cvvLength = getCvvDigits($cardType);
  }

  $: {
    if ($cardNumber.length > 6 && lastIin !== getIin($cardNumber)) {
      lastIin = getIin($cardNumber);
      if (lastIin) {
        getCardFeatures($cardNumber).then((data) => {
          const { emi } = data.flows;
          if (!emi) {
            Analytics.track('card:emi:invalid', {
              type: AnalyticsTypes.BEHAV,
              data: {
                iin: $cardIin,
              },
            });
          }
        });
      }
    }
  }

  export let tab;

  function handleFilled(curField) {
    const { tab, getAppliedOffer } = getSession();
    const { payment_method, issuer } = getAppliedOffer?.();

    if (tab === 'card' && tab === payment_method && issuer === 'cred') {
      // when card-apps offer(s) applied avoid focusing as offer-removal warning will come
      return;
    }
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

  function setDebitPinRadiosVisibility(visible) {
    if (visible) {
      $authType = DEFAULT_AUTH_TYPE_RADIO;
    }

    $showAuthTypeSelectionRadio = Boolean(visible);
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
   * @return {boolean}
   */
  function validateCardNumber() {
    const cardNumberWithoutSpaces = getCardDigits($cardNumber);

    let isValid = Formatter.rules.card.isValid.call({
      value: cardNumberWithoutSpaces,
      type: $cardType,
    });
    //Track AMEX Card input for merchants who don't have AMEX enabled.
    if (!isAMEXEnabled() && $cardType === 'amex') {
      isValid = false;
      Analytics.track('card:amex:disabled', {
        type: AnalyticsTypes.BEHAV,
        data: {
          iin: getIin($cardNumber),
        },
      });
    }

    //Track Diners Card input for merchants who don't have Diners enabled.
    if (!getCardNetworks().DICL && $cardType === 'diners') {
      isValid = false;
      Analytics.track('card:diners:disabled', {
        type: AnalyticsTypes.BEHAV,
        data: {
          iin: getIin($cardNumber),
        },
      });
    }

    return isValid;
  }

  /**
   * Checks and performs actions related to card flows
   * and validate the card input.
   */
  function onCardNumberChange() {
    const value = $cardNumber;
    const _cardNumber = getCardDigits(value);
    const iin = getIin(_cardNumber);
    if (iin.length < 6) {
      setDebitPinRadiosVisibility(false);
      setCardNumberValidity(validateCardNumber());

      return;
    }

    const flowChecker = ({ flows = {}, type, issuer } = {}) => {
      // recreating type as _type as we need to override while running cards-separation exeriment
      let _type = type;
      const _cardNumber = getCardDigits(value);
      const isIinSame = getIin(_cardNumber) === iin;
      let _validCardNumber = true;

      // If the card number was changed before response, do nothing
      if (!isIinSame) {
        return Promise.reject();
      }

      if (isStrictlyRecurring()) {
        let reccuringCardSecondaryCheck = false; // Network for credit, issuer for debit
        let isCardTypeAllowed = false;

        // API sends credit/debit. Mapping it here so that it fits into existing FE contracts
        const cardTypeMap = {
          debit: 'debit_card',
          credit: 'credit_card',
        };
        if (!_type && $methodInstrument?.method?.includes('_card')) {
          _type = $methodInstrument?.method;
        }
        if (!_type) {
          // We do not have enough data to validate
          isCardTypeAllowed = true;
          reccuringCardSecondaryCheck = true;
        } else {
          isCardTypeAllowed = isMethodEnabled(cardTypeMap[_type]);
          if (isCardTypeAllowed) {
            const allowedRecurringCardsData = getRecurringMethods().card || {};
            if (_type === 'debit') {
              reccuringCardSecondaryCheck = issuer
                ? !!allowedRecurringCardsData[_type][issuer]
                : true;
            } else if (_type === 'credit') {
              reccuringCardSecondaryCheck =
                !!getCardNetworksForRecurring()[$cardType];
            }
          }
        }

        _validCardNumber =
          _validCardNumber &&
          reccuringCardSecondaryCheck &&
          isFlowApplicable(flows, Flows.RECURRING);
      } else {
        // Debit-PIN is not supposed to work in case of recurring
        if (isFlowApplicable(flows, Flows.PIN)) {
          setDebitPinRadiosVisibility(true);
        } else {
          setDebitPinRadiosVisibility(false);
        }
      }

      return Promise.resolve(_validCardNumber);
    };

    getCardFeatures(iin)
      .then((features) => {
        let validationPromises = [
          flowChecker(features),
          validateCardNumber(),
          getCardMetadata(iin),
        ];

        /**
         * If there's a card/emi instrument, we check for its validity.
         * Otherwise we'll just assume that this is successful validation.
         */
        if ($methodInstrument && $methodInstrument.method === tab) {
          validationPromises.push(
            isInstrumentValidForPayment($methodInstrument, {
              method: tab,
              'card[number]': $cardNumber,
            })
          );
        } else {
          validationPromises.push(Promise.resolve(true));
        }

        return Promise.all(validationPromises);
      })
      .then(
        ([isFlowValid, isCardNumberValid, cardMetaData, isInstrumentValid]) => {
          /**
           * This variable tells whether the network of the current card
           * is enabled for the merchant.
           * Assumed true by default so that we let the payment go through
           * in case we don't fail to validate.
           */
          let isCurrentCardsNetworkEnabledForMerchant = true;

          // Find the entry in API_NETWORK_CODES_MAP
          let networkEntry = _Arr.find(
            _Obj.entries(API_NETWORK_CODES_MAP),
            (map) => map[1] === cardMetaData.network
          );

          if (networkEntry) {
            const apiNetwork = networkEntry[0]; // Card's network in API-representation
            const enabledNetworks = getCardNetworks(); // Merchant's enabled networks

            /**
             * getCardNetworks might return an empty object because API sometimes does not send
             * methods.card_networks for whatever reason
             */
            if (!_.isUndefined(enabledNetworks[apiNetwork])) {
              isCurrentCardsNetworkEnabledForMerchant = Boolean(
                enabledNetworks[apiNetwork]
              );
            }
          }

          // Card is unsupported if validation on instrument fails or if network is disabled for merchant
          showCardUnsupported =
            !isInstrumentValid || !isCurrentCardsNetworkEnabledForMerchant;

          setCardNumberValidity(
            isCardNumberValid &&
              isFlowValid &&
              isInstrumentValid &&
              isCurrentCardsNetworkEnabledForMerchant
          );

          // Track validity if instrument was used
          if ($methodInstrument) {
            Analytics.track('instrument:input:validate', {
              data: {
                method: $methodInstrument.method,
                instrument: $methodInstrument,
                valid: isInstrumentValid,
              },
            });
          }
        }
      )
      .catch(returnAsIs); // IIN changed, do nothing
  }

  $: {
    /**
     * When $methodInstrument changes and is a card instrument,
     * we'll need to perform all vaildations again
     */

    const hasCardMethodInstrument =
      $methodInstrument && $methodInstrument.method === 'card';
    if ($methodInstrument) {
      if ($methodInstrument.method === 'card') {
        onCardNumberChange();
      }
    } else {
      onCardNumberChange();
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
    //Track valid & invalid card number entered by the customer.

    Analytics.track('card_number:filled', {
      type: AnalyticsTypes.BEHAV,
      data: {
        card: getCardMetadata($cardNumber),
        valid: numberField.isValid(),
      },
    });
  }

  function trackCardNumberAutoFilled() {
    Analytics.track('card_number:autofilled', {
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

<div class="pad" id="add-card-container" class:faded>
  <div class="card-title">{$t(ADD_NEW_CARD)}</div>
  <div class="row card-fields">
    <div class="two-third">
      <NumberField
        id="card_number"
        bind:value={$cardNumber}
        bind:this={numberField}
        amexEnabled={isAMEXEnabled()}
        helpText={cardNumberHelpText}
        recurring={isRecurring()}
        {validCardForOffer}
        type={$cardType}
        on:focus
        on:filled={(_) => handleFilled('numberField')}
        on:autocomplete={trackCardNumberAutoFilled}
        on:input={handleCardInput}
        on:blur={trackCardNumberFilled}
      />
    </div>
    {#if !$hideExpiryCvvFields}
      <div class="third">
        <ExpiryField
          id="card_expiry"
          name="card[expiry]"
          bind:value={$cardExpiry}
          bind:this={expiryField}
          on:focus
          on:blur={trackExpiryFilled}
          on:filled={(_) => handleFilled('expiryField')}
        />
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
        on:focus
        on:blur={trackNameFilled}
      />
    </div>
    {#if !$hideExpiryCvvFields}
      <div class="third">
        <CvvField
          id="card_cvv"
          length={cvvLength}
          bind:value={$cardCvv}
          bind:this={cvvField}
          on:focus
          on:blur={trackCvvFilled}
        />
      </div>
    {/if}
  </div>
  {#if downtimeVisible}
    <div class="downtime-cards">
      <DowntimeCallout
        showIcon={true}
        severe={downtimeSeverity}
        {downtimeInstrument}
      />
    </div>
  {/if}
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
            on:focus
            on:change={trackRememberChecked}
            bind:checked={$remember}
          />
          <span class="checkbox" />
          <!-- LABEL: Remember Card -->
          {$t(REMEMBER_CARD_LABEL)}
        </label>
      {/if}
    </div>
    {#if tab === 'emi'}
      <div id="view-emi-plans" on:click={showEmiPlans} class="link">
        <!-- LABEL: View all EMI Plans -->
        {$t(VIEW_ALL_EMI_PLANS)}
      </div>
    {/if}
  </div>
  {#if $showNoCvvCheckbox}
    <div class="row">
      <label id="nocvv-check" for="nocvv">
        <input
          type="checkbox"
          class="checkbox--square"
          id="nocvv"
          bind:checked={$noCvvChecked}
        />
        <span class="checkbox" />
        <!-- LABEL: My Maestro Card doesn't have Expiry/CVV -->
        {$t(NOCVV_LABEL)}
      </label>
    </div>
  {/if}
  {#if $showAuthTypeSelectionRadio}
    <div class="row">
      <CardFlowSelectionRadio bind:value={$authType} />
    </div>
  {/if}
</div>

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

  .faded {
    opacity: 0.5;
  }
  .downtime-cards {
    margin-top: 16px;
  }

  .card-title {
    font-weight: normal;
    font-size: 14px;
    line-height: 17px;
    margin-top: 24px;
    color: #373737;
  }
</style>
