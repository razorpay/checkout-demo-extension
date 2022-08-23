<script lang="ts">
  // Svelte imports
  import { createEventDispatcher, tick } from 'svelte';

  // Utils imports
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { DEFAULT_AUTH_TYPE_RADIO } from 'common/constants';
  import SecureCard from 'ui/tabs/card/SecureCard.svelte';
  // Store
  import { selectedPlanTextForSavedCard } from 'checkoutstore/emi';
  import { isMethodUsable } from 'checkoutstore/methods';
  import { userConsentForTokenization } from 'checkoutstore/screens/card';

  import { setDynamicFeeObject } from 'checkoutstore/dynamicfee';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  import {
    SAVED_CARD_LABEL,
    NOCVV_LABEL,
    AUTH_TYPE_PIN,
    AUTH_TYPE_OTP,
  } from 'ui/labels/card';

  import {
    SAVED_CARD_UNAVAILABLE_HELP,
    EDIT_PLAN_TEXT,
    EDIT_PLAN_ACTION,
    AVAILABLE_TEXT,
    AVAILABLE_ACTION,
  } from 'ui/labels/emi';
  import { TITLE_GENERIC } from 'ui/labels/methods';
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';

  // UI imports
  import Radio from 'ui/elements/Radio.svelte';
  import CvvField from 'ui/elements/fields/card/CvvField.svelte';
  import DowntimeCallout from 'ui/elements/Downtime/Callout.svelte';
  import DowntimeIcon from 'ui/elements/Downtime/Icon.svelte';
  import { isDynamicFeeBearer, isRecurring, isRedesignV15 } from 'razorpay';

  // Props
  export let card;
  export let debitPin;
  export let plans;
  export let token;
  export let cvvDigits;
  export let selected;
  export let tab;
  export let isTokenised;
  let { downtimeSeverity, downtimeInstrument } = card;

  // Computed
  let attributes;
  let showOuter;
  let showCvv;

  let noCvvChecked = false;
  let cvvValue = '';
  let authType = debitPin ? 'c3ds' : '';

  const isRedesignV15Enabled = isRedesignV15();

  // Refs
  let cvvInput;
  let cvvInputFormatter;
  let collectCardTokenisationConsent = false;

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
  $: collectCardTokenisationConsent = selected && !isTokenised;

  function trackAtmRadio(event) {
    Analytics.track('atmpin:flows:change', {
      type: AnalyticsTypes.BEHAV,
      data: {
        default_auth_type: DEFAULT_AUTH_TYPE_RADIO,
        flow: event.target.value || null,
      },
    });
  }

  function handleClick(event, avoidFocus = false) {
    if (isDynamicFeeBearer()) {
      setDynamicFeeObject('card', card.type);
    }
    const payload = { cvv: cvvValue };
    // Focus on next tick because the CVV field might not have rendered right now.
    tick().then((_) => {
      if (cvvInput) {
        if (!avoidFocus) {
          cvvInput.focus();
        }
      }
    });

    if (debitPin) {
      payload.authType = authType;
    }

    dispatch('click', payload);
  }
  //#region cards-tokenization

  //#endregion
</script>

<div
  class="saved-card"
  class:checked={selected}
  class:recurring-saved-card={Boolean(isRecurring())}
  on:click={(event) => handleClick(event)}
  tabIndex="0"
  {...attributes}
>
  <div class="help up">
    <!-- LABEL: EMI is not available on this card-->
    {$t(SAVED_CARD_UNAVAILABLE_HELP)}
  </div>
  <div class="cardtype" cardtype={card.networkCode} />
  <div class="saved-inner">
    <div class="saved-number">
      <!-- LABEL: Card ending with {last4} -->
      <FormattedText
        text={formatTemplateWithLocale(
          SAVED_CARD_LABEL,
          { last4: card.last4 },
          $locale
        )}
      />
      {#if !isTokenised}<span class="card-non-tokenised"> * </span> {/if}
    </div>
    {#if !!downtimeSeverity && selected}
      <div class="downtime-saved-cards-icon">
        <DowntimeIcon severe={downtimeSeverity} />
      </div>
    {/if}
    <div class="saved-cvv" class:saved-card-one-cc={isRedesignV15Enabled}>
      {#if showCvv}
        <CvvField
          bind:value={cvvValue}
          on:input={(_) => dispatch('cvvchange', { cvv: cvvValue })}
          bind:this={cvvInput}
          length={cvvDigits}
          showHelp={false}
          showPlaceholder={!isRedesignV15Enabled}
          elemClasses={isRedesignV15Enabled && 'cvv-one-cc-wrapper'}
          inputFieldClasses={isRedesignV15Enabled && 'cvv-one-cc'}
          labelClasses={isRedesignV15Enabled && 'cvv-one-cc-label'}
          labelUpperClasses={isRedesignV15Enabled && 'cvv-one-cc-label-upper'}
        />
      {/if}
    </div>
  </div>

  {#if collectCardTokenisationConsent}
    <div class="saved-cards-tokenisation-consent">
      <SecureCard
        bind:checked={$userConsentForTokenization}
        savedcard
        modalType="existing-card"
        cvvRef={cvvInput}
        network={card.network}
      />
    </div>
  {/if}
  {#if showOuter && selected}
    <div class="saved-outer">
      {#if plans}
        <!-- TODO: refactor into separate component -->
        <div
          class="emi-plans-info-container emi-plans-trigger"
          data-bank={card.issuer}
          data-card-type={card.type}
          on:click={(event) => dispatch('viewPlans', event)}
        >
          {#if $selectedPlanTextForSavedCard && tab === 'emi'}
            <div class="emi-plan-selected emi-icon-multiple-cards">
              <!-- LABEL: {duration} Months ({amount}/mo) -->
              <div class="emi-plans-text">
                {formatTemplateWithLocale(
                  EDIT_PLAN_TEXT,
                  $selectedPlanTextForSavedCard,
                  $locale
                )}
              </div>
              <!-- LABEL: Edit -->
              <div class="emi-plans-action theme-highlight">
                {$t(EDIT_PLAN_ACTION)}
              </div>
            </div>
          {:else if tab !== 'emi' && isMethodUsable('emi')}
            <div class="emi-plan-unselected emi-icon-multiple-cards">
              <!-- LABEL: EMI Available -->
              <div class="emi-plans-text">{$t(AVAILABLE_TEXT)}</div>
              <!-- LABEL: Pay with EMI -->
              <div class="emi-plans-action theme-highlight">
                {$t(AVAILABLE_ACTION)}
              </div>
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
            bind:checked={noCvvChecked}
          />
          <span class="checkbox" />
          <!-- My Maestro Card doesn't have Expiry/CVV -->
          {$t(NOCVV_LABEL)}
        </label>
      {/if}

      {#if debitPin}
        <div class="elem-wrap flow-selection-container">
          <Radio
            checked={authType === 'c3ds'}
            containerClass="flow"
            id={`flow-3ds-${token}`}
            inputClass="auth_type_radio"
            label={formatTemplateWithLocale(
              TITLE_GENERIC,
              { method: $t(AUTH_TYPE_OTP) },
              $locale
            )}
            name={`auth_type-${token}`}
            value="c3ds"
            on:change={handleAuthRadioChanged}
          />
          <Radio
            contaierClass="flow"
            checked={authType === 'pin'}
            id={`flow-pin-${token}`}
            inputClass="auth_type_radio"
            label={formatTemplateWithLocale(
              TITLE_GENERIC,
              { method: $t(AUTH_TYPE_PIN) },
              $locale
            )}
            name={`auth_type-${token}`}
            value="pin"
            on:change={handleAuthRadioChanged}
          />
        </div>
      {/if}
    </div>
  {/if}

  {#if !!downtimeSeverity && selected}
    <div class="downtime-saved-cards">
      <DowntimeCallout
        showIcon={false}
        severe={downtimeSeverity}
        {downtimeInstrument}
      />
    </div>
  {/if}
</div>

<style lang="scss">
  :global(.redesign) {
    .saved-card.checked {
      border-color: var(--highlight-color) !important;
      background-color: var(--hover-state-color) !important;
    }
  }
  .downtime-saved-cards {
    margin-bottom: 8px;
  }
  .downtime-saved-cards-icon {
    margin-right: 8px;
    margin-top: 2px;
  }

  .recurring-saved-card {
    padding-bottom: 8px;
  }

  .card-non-tokenised {
    color: red;
    font-size: 16px;
    font-weight: 500;
    margin-left: 2px;
  }

  :global(.redesign) {
    :global(#saved-cards-container) .cardtype {
      width: 34px;
      height: 23px;
    }
  }
</style>
