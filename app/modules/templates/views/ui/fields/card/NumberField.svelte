<script>
  import { createEventDispatcher } from 'svelte';

  import Field from 'templates/views/ui/Field.svelte';
  import Icon from 'templates/views/ui/Icon.svelte';

  // Utils
  import { getSession } from 'sessionmanager';
  import { getIcon } from 'icons/network';

  export let value = '';
  export let type = null;
  export let id = '';

  // State
  let valid = false;

  const dispatch = createEventDispatcher();
  const session = getSession();

  // Refs
  let field = null;

  function handleInput(e) {
    value = e.target.value;
    dispatch('input', e.detail);
    dispatchFilledIfValid();
  }

  function getHelpText(methods, cardType, isRecurring) {
    if (isRecurring) {
      return 'Card does not support recurring payments.';
    }

    if (!methods.amex && type === 'amex') {
      return 'Amex cards are not supported for this transaction.';
    }

    return 'Please enter your card number.';
  }

  $: helpText = getHelpText(session.methods, type, session.recurring);

  export function dispatchFilledIfValid() {
    const caretPosition = field.getCaretPosition();

    if (valid) {
      /**
       * Focus on expiry elem if we have the entire card number
       * and the cursor is at the end of the input field.
       */
      if (
        value.length === caretPosition &&
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
  <!-- TODO: handle readonly -->
  <Field
    {id}
    formatter={{ type: 'card' }}
    {helpText}
    name="card[number]"
    required={true}
    {value}
    type="tel"
    autocomplete="off"
    label="Card Number"
    handleBlur
    handleFocus
    handleInput
    on:blur
    bind:this={field}
    on:input={handleInput} />
</div>
