<script lang="ts">
  // Svelte imports
  import { createEventDispatcher, onMount } from 'svelte';
  import * as _El from 'utils/DOM';
  //i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  import {
    CARD_NUMBER_LABEL,
    CARD_NUMBER_HELP,
    NAME_LABEL,
    NAME_HELP,
    BAJAJ_ISSUED_CARD,
    ADD_NEW_CARD_HEADER,
    PAY_VIA_EMI,
    CARD_DETAILS_HEADER,
    CARD_NOT_SUPPORTED,
    BAJAJ_FISNSEV_ISSUED_CARD,
  } from 'ui/labels/bajaj-emi';

  import { bajajTCAccepted, bajajTCAcceptedConsent } from 'checkoutstore/emi';
  import { isCurrentCardProviderInvalid } from 'emiV2/store';

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
  import { ENTER_CARD_DETAILS } from 'cta/i18n';
  import { TRY_ANOTHER_EMI_OPTION } from 'ui/labels/debit-emi';
  import { cardNumber } from 'checkoutstore/screens/card';

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

  onMount(() => {
    const emi_el_card = querySelector('input[name="card[number]"]');

    bajajTCAccepted.set(true);

    session.delegator
      .add('card', emi_el_card)
      .on('network', function () {
        const type = this.type;

        // card icon element
        this.el.parentNode
          .querySelector('.cardtype')
          .setAttribute('cardtype', type);
      })
      .on('change', function () {
        cardInvalid = false;
        let isValid = this.isValid();

        $isCurrentCardProviderInvalid = false;

        if (this.type !== 'bajaj') {
          isValid = false;
        }
        // set validity classes
        if (isValid) {
          _El.removeClass(this.el.parentNode, 'invalid');
        } else {
          cardInvalid = true;
          $isCurrentCardProviderInvalid = true;
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
      <div class="elem-wrap">
        <div class="elem elem-card filled">
          <div class="cardtype" />
          <!-- LABEL: Card Number -->
          <label>{$t(CARD_NUMBER_LABEL)}</label>
          <i>&#xe605;</i>
          <span class="help">
            <!-- LABEL: Please enter a valid Bajaj Finserv issued card number -->
            {$t(CARD_NUMBER_HELP)}
          </span>
          <input
            class="input"
            type="tel"
            name="card[number]"
            autocomplete="off"
            maxlength="19"
            value={prefill['card[number]']}
            on:blur={(e) => {
              if (isNewEmiFlow) {
                cardNumber.set(e.target.value);
              }
            }}
          />
        </div>
      </div>
      {#if cardInvalid}
        <p class="error-msg">{$t(CARD_NOT_SUPPORTED)}</p>
      {/if}
      <div class="elem-wrap" class:readonly={readonly.name}>
        <div class="elem elem-name filled">
          <!-- LABEL: Please enter name on your card -->
          <span class="help">{$t(NAME_HELP)}</span>
          <!-- LABEL: Card Holder's Name -->
          <label>{$t(NAME_LABEL)}</label>
          <i>&#xe602;</i>
          <input
            class="input"
            type="text"
            name="card[name]"
            required
            value={prefill.name}
            pattern={"^[a-zA-Z. 0-9'-]{1,100}$"}
            readonly={readonly.name}
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
    </div>
  </div>
  <CTA
    screen={isNewEmiFlow ? 'card' : 'emi'}
    tab={'emi'}
    disabled={cardInvalid && isNewEmiFlow ? false : !$bajajTCAccepted}
    show
    showAmount
    label={!isNewEmiFlow
      ? ENTER_CARD_DETAILS
      : cardInvalid
      ? TRY_ANOTHER_EMI_OPTION
      : PAY_VIA_EMI}
  />
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
</style>
