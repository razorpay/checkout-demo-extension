<script lang="ts">
  // UI Imports
  import NumberField from 'ui/elements/fields/card/NumberField.svelte';
  import ExpiryField from 'ui/elements/fields/card/ExpiryField.svelte';
  import CvvField from 'ui/elements/fields/card/CvvField.svelte';
  import CardFlowSelectionRadio from 'ui/elements/CardFlowSelectionRadio.svelte';
  import NameField from 'ui/elements/fields/card/NameField.svelte';
  import DowntimeCallout from 'ui/elements/Downtime/Callout.svelte';
  import { returnAsIs } from 'lib/utils';
  import SecureCard from 'ui/tabs/card/SecureCard.svelte';
  import { getSession } from 'sessionmanager';
  // Svelte imports
  import { createEventDispatcher, onMount } from 'svelte';

  import { getComponentProps } from 'utils/svelteUtils';

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

  import {
    methodInstrument,
    isIndianCustomer,
  } from 'checkoutstore/screens/home';

  import {
    getCardFeatures,
    isOfferForced,
    isStrictlyRecurring,
    getRecurringMethods,
    isRecurring,
    isRedesignV15,
    isDynamicFeeBearer,
  } from 'razorpay';
  import { dynamicFeeObject, showFeesIncl } from 'checkoutstore/dynamicfee';
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
    CARD_NUMBER_HELP_UNSUPPORTED,
    ADD_NEW_CARD,
  } from 'card/i18n/labels';

  // Utils
  import Analytics, { CardEvents, Events } from 'analytics/index';
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
  import { isCardValidForOffer } from 'offers/store';
  import { viewAllEMIPlans } from 'emi/helper';
  import { isNameReadOnly } from 'checkoutframe/customer';
  import { shouldRememberCard } from './utils';

  const dispatch = createEventDispatcher();

  let numberField = null;
  let expiryField = null;
  let nameField = null;
  let cvvField = null;
  const nameReadonly = isNameReadOnly();
  export let downtimeVisible;
  export let downtimeSeverity;
  export let downtimeInstrument;
  export let delayOTPExperiment;
  export let isCardSupportedForRecurring;

  const isRedesignV15Enabled = isRedesignV15();

  let showRememberCardCheck = shouldRememberCard($isIndianCustomer);
  let cvvLength = 3;
  let showCardUnsupported = false;
  let lastIin = '';

  let oneCCFieldProps = {};

  $: {
    if (isRedesignV15Enabled) {
      oneCCFieldProps = {
        elemClasses: 'add-card-fields-one-cc-wrapper',
        inputFieldClasses: 'add-card-fields-one-cc',
        labelClasses: 'add-card-fields-label-one-cc',
        labelUpperClasses: 'add-card-fields-label-upper-one-cc',
      };
    }
  }

  let cardNumberHelpText;
  $: {
    cardNumberHelpText =
      showCardUnsupported && $cardNumber.length > 6
        ? $t(CARD_NUMBER_HELP_UNSUPPORTED)
        : undefined;
  }

  export let faded = false;

  let validCardForOffer = true;
  $: {
    /**
     * If user goes back from add card screen, and change contact number
     * (IN->non-IN, non-IN->IN)
     * and comes again to add card screen, show remember card check
     * don't update
     * FIX: adding this assignment in reactive block, so every update has
     *      correct valie
     */
    showRememberCardCheck = shouldRememberCard($isIndianCustomer);

    if (!$isCardValidForOffer && isOfferForced()) {
      validCardForOffer = false;
      setCardNumberValidity(false);
    } else {
      validCardForOffer = true;
    }
  }

  onMount(() => {
    Events.TrackBehav(CardEvents.ADD_NEW_CARD, {
      PayWithSavedCard: delayOTPExperiment,
    });
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
    if ($cardNumber.length <= 0 && isDynamicFeeBearer()) {
      const session = getSession();
      let amount = session.get('amount');
      session.updateAmountInHeader(amount, false);
      dynamicFeeObject.set({});
      showFeesIncl.set({});
    }
    if ($cardNumber.length > 6 && lastIin !== getIin($cardNumber)) {
      lastIin = getIin($cardNumber);
      if (lastIin) {
        getCardFeatures($cardNumber).then((data) => {
          const { emi } = data.flows || {};
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
    const { payment_method, issuer } = getAppliedOffer?.() || {};

    if (tab === 'card' && tab === payment_method && issuer === 'cred') {
      // when card-apps offer(s) applied avoid focusing as offer-removal warning will come
      return;
    }
    switch (curField) {
      case 'numberField':
        getComponentProps(expiryField, 'ref').focus();
        break;
      case 'expiryField':
        $cardName
          ? getComponentProps(cvvField, 'ref')?.focus()
          : getComponentProps(nameField, 'ref')?.focus();
        break;
      default:
        return;
    }
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
          prepaid: 'prepaid_card',
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
            } else if (_type === 'credit' || _type === 'prepaid') {
              reccuringCardSecondaryCheck =
                !!getCardNetworksForRecurring(_type)[$cardType];
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
          let networkEntry = Object.entries(API_NETWORK_CODES_MAP).find(
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

  function onNameFilled() {
    Analytics.track('card_name:filled', {
      type: AnalyticsTypes.BEHAV,
      data: {
        valid: nameField?.isValid(),
      },
    });
  }
</script>

<div class="pad" id="add-card-container" class:faded>
  <div class="page-header">
    <span class="card-title">{$t(ADD_NEW_CARD)} </span>
    <span class="emi-plans-label">
      {#if tab === 'emi'}
        <div id="view-emi-plans" on:click={viewAllEMIPlans}>
          <!-- LABEL: View all EMI Plans -->
          {$t(VIEW_ALL_EMI_PLANS)}
        </div>
      {/if}
    </span>
  </div>
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
        {isCardSupportedForRecurring}
        on:focus
        on:filled={(_) => handleFilled('numberField')}
        on:autocomplete={trackCardNumberAutoFilled}
        on:input={handleCardInput}
        on:blur={trackCardNumberFilled}
        {...oneCCFieldProps}
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
          {...oneCCFieldProps}
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
        on:blur={onNameFilled}
        {...oneCCFieldProps}
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
          {...oneCCFieldProps}
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
        <SecureCard
          bind:checked={$remember}
          on:change={trackRememberChecked}
          modalType="add-new-card"
        />
      {/if}
    </div>
  </div>
  {#if $showNoCvvCheckbox}
    <div
      class="row maestro-card-block"
      class:maestro-card-block-one-cc={isRedesignV15Enabled}
    >
      <label id="nocvv-check" for="nocvv">
        <input
          type="checkbox"
          class="checkbox--square"
          id="nocvv"
          bind:checked={$noCvvChecked}
        />
        <span class="checkbox" />
        <!-- LABEL: My Maestro Card doesn't have Expiry/CVV -->
        <span class="maestro-card-block-label-text"> {$t(NOCVV_LABEL)}</span>
      </label>
    </div>
  {/if}
  {#if $showAuthTypeSelectionRadio}
    <div class="row">
      <CardFlowSelectionRadio bind:value={$authType} />
    </div>
  {/if}
</div>

<style lang="scss">
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
    color: #373737;
  }

  .page-header {
    margin-top: 24px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
  }

  :global(.redesign) .page-header {
    margin-top: 20px;
  }

  .emi-plans-label {
    font-weight: 500;
    font-size: 11px;
    line-height: 20px;
    text-decoration-line: underline;
    color: #3684d6;
  }

  .maestro-card-block {
    /* margin-left: 5px; */
    margin-top: 15px;
  }

  .maestro-card-block-one-cc {
    margin-top: 24px;
  }

  .maestro-card-block label {
    font-size: 14px;
    line-height: 14px;
    color: #373737;
  }
  .maestro-card-block-label-text {
    margin-left: 5px;
  }

  :global(#content.one-cc) .card-title {
    font-weight: 600;
    color: #263a4a;
  }

  :global(.redesign) {
    .remember-check {
      margin-top: 14px;
    }

    .save_card_label_text {
      margin-bottom: 1px;
    }
  }
</style>
