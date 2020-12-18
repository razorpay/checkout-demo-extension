<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI Imports
  import Field from 'ui/components/Field.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // i18n
  import { t } from 'svelte-i18n';

  import {
    CARD_NUMBER_LABEL,
    CARD_NUMBER_HELP,
    CARD_NUMBER_HELP_AMEX,
    CARD_NUMBER_HELP_RECURRING,
  } from 'ui/labels/card';

  // Utils
  import { getIcon } from 'icons/network';

  export let value = '';
  export let type = null;
  export let id = '';
  export let amexEnabled = false;
  export let recurring = false;
  export let helpText;

  // State
  let valid = false;

  const dispatch = createEventDispatcher();

  // Refs
  let field = null;

  function handleInput(e) {
    value = e.target.value;
  }

  $: helpText = helpText || $t(getHelpTextLabel());

  function getHelpTextLabel(locale) {
    if (recurring) {
      // LABEL: Card does not support recurring payments.
      return CARD_NUMBER_HELP_RECURRING;
    }

    if (amexEnabled && type === 'amex') {
      // LABEL: Amex cards are not supported for this transaction.
      return CARD_NUMBER_HELP_AMEX;
    }

    // LABEL: Please enter a valid card number.
    return CARD_NUMBER_HELP;
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
</style>

<div class="field-container">
  {#if type}
    <div class="icon">
      <Icon icon={getIcon(type)} />
    </div>
  {/if}
  <Field
    {id}
    formatter={{ type: 'card' }}
    {helpText}
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
    on:input />
</div>
