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

  const dispatch = createEventDispatcher();
  const session = getSession();

  let invalid = false;
  let field = null;
  let formatterObj = null;

  export function getType() {
    return type;
  }

  function handleInput(e) {
    value = e.target.value;
    setCardValidity(sync());
    dispatch('input', e.detail);
  }

  /**
   * Validate the card number.
   * @return {Boolean}
   */
  export function sync() {
    const cardNumber = getCardDigits(value);
    const cardType = getCardType(cardNumber);

    let isValid = Formatter.rules.card.isValid.call({
      value: cardNumber,
      type: cardType,
    });

    if (!session.preferences.methods.amex && cardType === 'amex') {
      isValid = false;
    }

    return isValid;
  }

  function handleNetwork(data) {
    type = data.type;
    dispatch('network', data);
    // TODO: check what amex, maestro and noamex classes do
    // update cvv element
    // var cvvlen = type !== 'amex' ? 3 : 4;
    // el_cvv.maxLength = cvvlen;
    // el_cvv.pattern = '^[0-9]{' + cvvlen + '}$';
    // $(el_cvv)
    //   .toggleClass('amex', type === 'amex')
    //   .toggleClass('maestro', type === 'maestro');
    //
    // if (!preferences.methods.amex && type === 'amex') {
    //   $('#elem-card').addClass('noamex');
    // } else {
    //   $('#elem-card').removeClass('noamex');
    // }
  }

  export function setCardValidity(isValid) {
    const cardNumber = getCardDigits(value);
    const cardType = getCardType(cardNumber);
    const caretPosition = field.getCaret();

    if (isValid) {
      invalid = false;
      /**
       * Focus on expiry elem if we have the entire card number
       * and the cursor is at the end of the input field.
       */
      if (
        value.length === caretPosition &&
        document.activeElement === field.input
      ) {
        if (cardType !== 'maestro') {
          dispatch('filled');
        }
      }
    } else {
      invalid = true;
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

<div class="field-container {invalid ? 'name_readonly' : ''}">
  {#if type}
    <div class="icon">
      <Icon icon={getIcon(type)} />
    </div>
  {/if}
  <!-- TODO: set maxlength based on type or remove from here if already handled by formatter -->
  <!-- TODO: handle prefill and readonly -->
  <!-- TODO: change help message for AMEX -->
  <Field
    {id}
    formatter={{ type: 'card', on: { network: handleNetwork } }}
    helpText="Please enter your card number"
    name="card[number]"
    required={true}
    {value}
    type="tel"
    formatterObj
    autocomplete="off"
    label="Card Number"
    handleBlur
    handleFocus
    handleInput
    on:blur
    maxlength={19}
    bind:this={field}
    on:input={handleInput} />
</div>
