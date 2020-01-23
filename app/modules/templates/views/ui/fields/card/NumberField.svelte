<script>
  import { createEventDispatcher } from 'svelte';

  import Field from 'templates/views/ui/Field.svelte';
  import Icon from 'templates/views/ui/Icon.svelte';
  import { getSession } from 'sessionmanager';
  import { Formatter } from 'formatter';
  import { getCardType, getIin, getCardDigits } from 'common/card';
  import { getIcon } from 'icons/network';

  export let value = '';
  export let type = null;
  export let id = '';
  export let valid = false;

  const dispatch = createEventDispatcher();
  const session = getSession();

  let field = null;

  export function getType() {
    return type;
  }

  function handleInput(e) {
    value = e.target.value;
    setCardValidityAndDispatchFilled();
    dispatch('input', e.detail);
  }

  function getHelpText(methods, cardType) {
    if (!methods.amex && type === 'amex') {
      return 'Amex cards are not supported for this transaction.';
    }
    return 'Please enter your card number';
  }

  $: helpText = getHelpText(session.methods, type);

  /**
   * Validate the card number.
   * @return {Boolean}
   */
  export function sync() {
    const cardNumber = getCardDigits(value);

    let isValid = Formatter.rules.card.isValid.call({
      value: cardNumber,
      type,
    });

    if (!session.preferences.methods.amex && type === 'amex') {
      isValid = false;
    }

    return isValid;
  }

  export function setCardValidityAndDispatchFilled() {
    const isValid = sync();
    const caretPosition = field.getCaret();

    valid = isValid;

    if (isValid) {
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

  $: {
    if (field) {
      // TODO: fix invalid being overridden by onInput
      field.setValid(valid);
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
  <!-- TODO: Fix invalid class not being applied -->
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
