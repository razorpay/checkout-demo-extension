<script lang="ts">
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI Imports
  import Field from 'ui/components/Field.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // i18n
  import { t, locale } from 'svelte-i18n';

  import {
    CARD_NUMBER_LABEL,
    CARD_NUMBER_HELP,
    CARD_NUMBER_HELP_AMEX,
    CARD_NUMBER_HELP_RECURRING,
    CARD_NUMBER_HELP_UNSUPPORTED_OFFER,
  } from 'ui/labels/card';

  // Utils
  import { getIcon } from 'icons/network';
  import { formatMessageWithLocale } from 'i18n';
  import { isRedesignV15 } from 'razorpay';
  import { isIndianCustomer } from 'checkoutstore/screens/home';
  import { isSIHubEnabledMerchant } from 'ui/tabs/card/utils';
  import autotest from 'autotest';

  export let value = '';
  export let type = null;
  export let id = '';
  export let amexEnabled = false;
  export let recurring = false;
  export let helpText;
  export let validCardForOffer = true;
  export let isCardSupportedForRecurring;

  export let elemClasses;
  export let inputFieldClasses;
  export let labelClasses;
  export let labelUpperClasses;
  export let showValidations;

  // State
  let valid = false;

  const dispatch = createEventDispatcher();

  const isRedesignV15Enabled = isRedesignV15();

  // Refs
  let field = null;

  function handleInput(e) {
    value = e.target.value;
  }

  let helpTextToDisplay;
  $: {
    helpTextToDisplay =
      (value && helpText) || (!valid ? getHelpText($locale) : undefined);
  }

  function getHelpText(locale) {
    if (
      $isIndianCustomer && // Card ristricutions are for domestic users only
      recurring &&
      value &&
      !isCardSupportedForRecurring &&
      !isSIHubEnabledMerchant()
    ) {
      // LABEL: Card does not support recurring payments.
      return formatMessageWithLocale(CARD_NUMBER_HELP_RECURRING, locale);
    }

    if (!amexEnabled && type === 'amex') {
      // LABEL: Amex cards are not supported for this transaction.
      return formatMessageWithLocale(CARD_NUMBER_HELP_AMEX, locale);
    }

    if (!validCardForOffer) {
      return formatMessageWithLocale(
        CARD_NUMBER_HELP_UNSUPPORTED_OFFER,
        locale
      );
    }

    // LABEL: Please enter a valid card number.
    return formatMessageWithLocale(CARD_NUMBER_HELP, locale);
  }

  export function dispatchFilledIfValid() {
    const caretPosition = field.getCaretPosition();

    if (valid) {
      /**
       * Focus on expiry elem if we have the entire card number
       * and the cursor is at the end of the input field.
       * Also focus on expiry elem does not occur if card length is zero.
       */
      if (
        value.length === caretPosition &&
        value.length !== 0 &&
        document.activeElement === field.input
      ) {
        if (type !== 'maestro') {
          dispatch('filled');
        }
      }
    }
  }

  export function setValid(isValid) {
    valid = isValid;
    if (field) {
      field.setValid(isValid);
    }
  }

  export function isValid() {
    return valid;
  }
</script>

<div class="field-container">
  {#if type}
    <div class="icon" class:icon-1cc={isRedesignV15Enabled}>
      <Icon icon={getIcon(type)} />
    </div>
  {/if}
  <Field
    {id}
    formatter={{ type: 'card' }}
    helpText={helpTextToDisplay}
    validationText={isRedesignV15Enabled && helpTextToDisplay}
    name="card[number]"
    required={true}
    {value}
    type="tel"
    autocomplete="cc-number"
    label={$t(CARD_NUMBER_LABEL)}
    handleBlur
    handleFocus
    handleInput
    bind:this={field}
    on:focus
    on:blur
    on:autocomplete
    on:input={handleInput}
    on:input
    {elemClasses}
    {inputFieldClasses}
    {labelClasses}
    {labelUpperClasses}
    {showValidations}
    attributes={{ ...autotest('cardNumber') }}
  />
</div>

<style>
  .field-container {
    position: relative;
  }

  .icon {
    position: absolute;
    right: 4px;
    top: 30px;
    bottom: 0;
    width: 24px;
  }

  .icon-1cc {
    position: absolute;
    right: 6%;
    top: 25%;
    bottom: 0;
    width: 24px;
  }
</style>
