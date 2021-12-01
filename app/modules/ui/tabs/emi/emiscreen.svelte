<script>
  // Svelte imports
  import { createEventDispatcher, onMount } from 'svelte';

  //i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';

  import {
    CARD_DETAILS_HEADER,
    CARD_NUMBER_LABEL,
    CARD_NUMBER_HELP,
    NAME_LABEL,
    NAME_HELP,
    CALLOUT,
  } from 'ui/labels/bajaj-emi';

  import { EDIT_PLAN_TEXT, EDIT_PLAN_ACTION } from 'ui/labels/emi';

  // Utils imports
  import { getSession } from 'sessionmanager';

  import {
    getPrefilledName,
    isNameReadOnly,
    getPrefilledCardNumber,
  } from 'razorpay';

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
    const emi_el_card = _Doc.querySelector(
      '#form-emi input[name="card[number]"]'
    );

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
    </div>
  </div>
</div>
<div class="pad recurring-message">
  <span>&#x2139;</span>
  <!-- LABEL: You need to have a
  <strong>Bajaj Finserv issued card</strong>
  to continue. -->
  <FormattedText text={$t(CALLOUT)} />
</div>
