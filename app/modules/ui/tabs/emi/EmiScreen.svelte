<script lang="ts">
  // Svelte imports
  import { createEventDispatcher, onMount } from 'svelte';
  import * as _El from 'utils/DOM';
  //i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  import {
    CARD_NUMBER_HELP,
    NAME_HELP,
    BAJAJ_ISSUED_CARD,
    ADD_NEW_CARD_HEADER,
    PAY_VIA_EMI,
    CARD_DETAILS_HEADER,
    CARD_NOT_SUPPORTED,
    BAJAJ_FISNSEV_ISSUED_CARD,
    KNOW_BAJAJ_EMI_CARD,
  } from 'ui/labels/bajaj-emi';

  import {
    bajajTCAccepted,
    bajajTCAcceptedConsent,
    selectedPlan,
  } from 'checkoutstore/emi';
  import { isCurrentCardProviderInvalid, selectedBank } from 'emiV2/store';

  import { EDIT_PLAN_TEXT, EDIT_PLAN_ACTION } from 'ui/labels/emi';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { querySelector } from 'utils/doc';

  import {
    getPrefilledName,
    getPrefilledCardNumber,
    isRedesignV15,
    isEmiV2,
  } from 'razorpay';
  import { isNameReadOnly } from 'checkoutframe/customer';
  import CTA from 'cta';
  import CTAOld from 'ui/elements/CTA.svelte';
  import { TRY_ANOTHER_EMI_OPTION } from 'ui/labels/debit-emi';
  import { cardNumber } from 'checkoutstore/screens/card';
  import NumberField from 'ui/elements/fields/card/NumberField.svelte';
  import NameField from 'ui/elements/fields/card/NameField.svelte';
  import type { addCardMeta } from 'emiV2/types';
  import {
    trackAddCardDetails,
    trackAddCardDetailsError,
  } from 'emiV2/events/tracker';
  import { selectedTab } from 'components/Tabs/tabStore';
  import { handleBackNavigation } from 'emiV2/helper/navigation';

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

  const isNewEmiFlow = isEmiV2();
  let cardInvalid = false;
  // variable to store whether card field is empty
  let cardEmpty = true;
  let numberField = null;
  let cardHolderName = prefill.name;
  let cardType = '';

  let oneCCFieldProps = {};

  onMount(() => {
    const emi_el_card = querySelector('input[name="card[number]"]');

    bajajTCAccepted.set(true);

    session.delegator
      .add('card', emi_el_card)
      .on('network', function () {
        const type: string = this.type;

        // card icon element
        const cardTypeIcon = document.querySelector('.cardtype');

        if (cardTypeIcon) {
          cardTypeIcon.setAttribute('cardtype', type);
        }
      })
      .on('change', function () {
        cardInvalid = false;
        let isValid = this.isValid();

        $isCurrentCardProviderInvalid = false;
        cardEmpty = !this.value;
        cardType = this.type;
        if (this.type !== 'bajaj') {
          isValid = false;
        }
        // set validity classes
        if (isValid) {
          _El.removeClass(this.el.parentNode, 'invalid');
        } else {
          cardInvalid = true;
          // setting card provider invalid if only card number exists
          if (this.value) {
            $isCurrentCardProviderInvalid = true;
          }
          _El.addClass(this.el.parentNode, 'invalid');
        }
      });
  });

  export function setPlan(plan) {
    const { text, duration } = plan;

    emiText = text;
    emiDuration = duration;
  }

  function handleCheckboxConsent() {
    if ($bajajTCAccepted === true) {
      $bajajTCAcceptedConsent = false;
    }
  }

  const isRedesignV15Enabled = isRedesignV15();

  if (isRedesignV15Enabled) {
    oneCCFieldProps = {
      elemClasses: 'add-card-fields-one-cc-wrapper',
      inputFieldClasses: 'add-card-fields-one-cc',
      labelClasses: 'add-card-fields-label-one-cc',
      labelUpperClasses: 'add-card-fields-label-upper-one-cc',
    };
  }

  let showValidationError = false;
  $: {
    // showing input validation only when card number entered is not supported
    // and the input field contains some values
    showValidationError = cardInvalid && !cardEmpty && isNewEmiFlow;
  }

  const handleInput = (e) => {
    cardHolderName = e.target.value;
  };

  const trackCardEntered = () => {
    if ($selectedPlan) {
      // Since Bajaj card dont have a type value (credit/debit)
      // card issuer and network will be bajaj for this case
      const trackMeta: addCardMeta = {
        card_type: 'NA',
        card_issuer: cardType,
        card_network: cardType,
        provider_name: $selectedBank?.code || 'NA',
        tab_name: $selectedTab,
        emi_plan: {
          nc_emi_tag: $selectedPlan.subvention === 'merchant',
          tenure: $selectedPlan.duration,
        },
      };

      trackAddCardDetails(trackMeta);
      // if card is invalid track card entered error event
      if (cardInvalid) {
        trackAddCardDetailsError(trackMeta, 'bank', $t(CARD_NOT_SUPPORTED));
      }
    }
  };

  export function preventBack() {
    handleBackNavigation();
    return false;
  }
</script>

<div
  class:bajaj-emi-screen={isNewEmiFlow}
  class:bajaj-emi-one-cc={isRedesignV15Enabled}
  class="pad"
>
  <div id="add-emi-container">
    <input type="hidden" name="emi_duration" bind:value={emiDuration} />
    <div class="clear" />
    <div
      class="strip emi-plans-info-container emi-plans-trigger details-visible"
      on:click={() => dispatch('editplan')}
    >
      <div class="emi-plan-selected emi-icon-multiple-cards">
        <div class="emi-plans-text">
          {formatTemplateWithLocale(EDIT_PLAN_TEXT, emiText, $locale)}
        </div>
        <div class="emi-plans-action theme-highlight">
          {$t(EDIT_PLAN_ACTION)}
        </div>
      </div>
    </div>
    {#if isNewEmiFlow}
      <h3 class="bajaj-screen-header">{$t(BAJAJ_ISSUED_CARD)}</h3>
      <p class="add-bajaj-label">{$t(ADD_NEW_CARD_HEADER)}</p>
    {:else}
      <h3>{$t(CARD_DETAILS_HEADER)}</h3>
    {/if}
    <div class="card-fields">
      <div>
        <div class="input-container">
          <div
            class:card-type-redesigned={isRedesignV15Enabled}
            class="cardtype"
          />
          <NumberField
            id="card_number"
            value={prefill['card[number]']}
            bind:this={numberField}
            on:focus
            on:blur={(e) => {
              if (cardInvalid) {
                numberField.setValid(false);
              } else {
                numberField.setValid(true);
              }
              if (isNewEmiFlow) {
                cardNumber.set(e.target.value);
                trackCardEntered();
              }
            }}
            helpText={!cardInvalid
              ? ''
              : isNewEmiFlow
              ? $t(CARD_NOT_SUPPORTED)
              : $t(CARD_NUMBER_HELP)}
            showValidations={showValidationError}
            {...oneCCFieldProps}
          />
        </div>
      </div>
      <!-- Only show the card invalid message if entered card is invalid for old checkout design -->
      {#if showValidationError && !isRedesignV15Enabled}
        <p class="error-msg">
          {$t(CARD_NOT_SUPPORTED)}
        </p>
      {/if}
      <div class="name-input-container" class:readonly={readonly.name}>
        <div>
          <NameField
            id="card_name"
            name="card[name]"
            readonly={readonly.name}
            value={prefill.name}
            helpText={$t(NAME_HELP)}
            on:input={handleInput}
            on:focus
            {...oneCCFieldProps}
          />
        </div>
      </div>
      <div class="elem-wrap elem-wrap-bajaj-tc">
        <label id="bajaj">
          <input
            type="checkbox"
            id="bajaj"
            bind:checked={$bajajTCAccepted}
            on:change={handleCheckboxConsent}
          />
          <span class="checkbox" />
          I agree to the
          <span class="tc-text">
            <a
              href="https://www.bajajfinserv.in/all-fees-and-charges-new#ec"
              target="_blank"
            >
              Terms and Conditions
            </a>
          </span>
        </label>
        {#if $bajajTCAcceptedConsent && !$bajajTCAccepted}
          <div class="bajaj-tooltip">Required</div>
        {/if}
      </div>
      <div class="elem-wrap elem-wrap-bajaj-tc mandatory-note-margin-bottom">
        <span class="mandatory-check">
          <span class:hide-note={isNewEmiFlow} class="mandatory-check-note">
            Note:
          </span>
          {BAJAJ_FISNSEV_ISSUED_CARD}
        </span>
      </div>
      <div class="bajaj-know-card">
        <span class="know-card-text">
          {$t(KNOW_BAJAJ_EMI_CARD)}
        </span>
      </div>
    </div>
  </div>
  <!-- if card is invalid and emi flow is now and card is enetered
  cta should be enabled since we show 'Try Another EMI option' CTA -->
  <CTA
    screen={isNewEmiFlow ? 'bajaj' : 'emi'}
    tab={'emi'}
    disabled={cardInvalid && !cardEmpty && isNewEmiFlow
      ? false
      : Boolean(
          cardEmpty || cardInvalid || !cardHolderName || !$bajajTCAccepted
        )}
    show
    showAmount
    onSubmit={() => {
      session.preSubmit();
    }}
    label={showValidationError ? TRY_ANOTHER_EMI_OPTION : PAY_VIA_EMI}
  />
  <!-- Showing old CTA for old checkout design
    to handle cta disability and label states
    (since for new emi flow navstack is used so handling cta label logic here)
    on click of the cta calling the presubmit to take over the payment flow
   -->
  {#if !isRedesignV15Enabled && isNewEmiFlow}
    <CTAOld
      on:click={() => {
        session.preSubmit();
      }}
    >
      {showValidationError ? $t(TRY_ANOTHER_EMI_OPTION) : $t(PAY_VIA_EMI)}
    </CTAOld>
  {/if}
</div>

<style>
  .bajaj-emi-screen {
    margin-top: 47px;
  }

  .bajaj-emi-one-cc {
    margin-top: 0px;
  }

  .emi-plans-info-container {
    display: none;
  }

  .add-bajaj-label {
    margin: 0;
    margin-top: 24px;
    color: #263a4a;
    font-size: 14px;
    font-weight: 600;
  }

  .bajaj-screen-header {
    color: #263a4a;
    font-size: 14px;
    text-transform: none;
  }
  .bajaj-tooltip {
    transition: 0.25s ease-in transform, 0.16s ease-in opacity;
    transform: translateY(-10px);
    color: #fff;
    position: absolute;
    line-height: 16px;
    padding: 6px 12px;
    font-size: 12px;
    background: #555;
    box-shadow: rgba(0, 0, 0, 0.05) 1px 1px 2px 0;
    z-index: 3;
    border-radius: 2px;
    bottom: -33px;
    pointer-events: none;
  }
  .bajaj-tooltip::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent #555;
    bottom: 100%;
    left: 15px;
    margin: 0 0 -1px -10px;
  }

  .tc-text {
    cursor: pointer;
    color: #3684d6;
  }

  :not(.checkbox--square):checked + .checkbox::after {
    content: '';
    width: 7px;
    height: 3px;
    position: absolute;
    top: 4px;
    left: 3px;
    border: 1px solid #fff;
    border-top: none;
    border-right: none;
    transform: rotate(-45deg);
  }

  .elem-wrap {
    height: 60px;
  }

  .elem-wrap-bajaj-tc {
    height: 32px;
    margin-top: 5px;
    position: relative;
  }

  .mandatory-check {
    font-size: 12px;
    line-height: 16px;
  }

  .mandatory-check-note {
    color: #7d7d7d;
  }

  .mandatory-note-margin-bottom {
    margin-bottom: 10px;
    display: none;
  }
  .mandatory-note-margin-bottom.hide-note {
    display: none;
  }
  .error-msg {
    font-size: 10px;
    color: #b21528;
    margin: 0;
    margin-top: 4px;
  }

  .input-container {
    position: relative;
  }

  .name-input-container {
    margin-top: 16px;
  }
  .cardtype {
    position: absolute;
    right: 0;
    top: 26px;
  }

  .card-type-redesigned {
    top: 16px;
  }

  .bajaj-know-card .know-card-text {
    font-size: 11px;
    font-style: italic;
    color: #333;
    font-weight: 500;
  }
</style>
