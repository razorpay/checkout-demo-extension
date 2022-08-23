<script lang="ts">
  // Svelte imports
  import { createEventDispatcher, onMount } from 'svelte';
  import * as _El from 'utils/DOM';
  //i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  import {
    CARD_DETAILS_HEADER,
    CARD_NUMBER_LABEL,
    CARD_NUMBER_HELP,
    NAME_LABEL,
    NAME_HELP,
  } from 'ui/labels/bajaj-emi';

  import { bajajTCAccepted, bajajTCAcceptedConsent } from 'checkoutstore/emi';

  import { EDIT_PLAN_TEXT, EDIT_PLAN_ACTION } from 'ui/labels/emi';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import { querySelector } from 'utils/doc';

  import { getPrefilledName, getPrefilledCardNumber } from 'razorpay';
  import { isNameReadOnly } from 'checkoutframe/customer';
  import CTA from 'cta';
  import { ENTER_CARD_DETAILS } from 'cta/i18n';

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
    const emi_el_card = querySelector('#form-emi input[name="card[number]"]');

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

  function handleCheckboxConsent() {
    if ($bajajTCAccepted === true) {
      $bajajTCAcceptedConsent = false;
    }
  }
</script>

<div class="pad">
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
    <h3>{$t(CARD_DETAILS_HEADER)}</h3>
    <div class="card-fields">
      <div class="elem-wrap">
        <div class="elem elem-card">
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
          />
        </div>
      </div>
      <div class="elem-wrap" class:readonly={readonly.name}>
        <div class="elem elem-name">
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
          <span class="mandatory-check-note"> Note: </span> You need to have a Bajaj
          Finserv issued card to continue with this emi option
        </span>
      </div>
    </div>
  </div>
  <CTA
    screen="emi"
    tab={'emi'}
    disabled={false}
    show
    showAmount
    label={ENTER_CARD_DETAILS}
  />
</div>

<style>
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
  }
</style>
