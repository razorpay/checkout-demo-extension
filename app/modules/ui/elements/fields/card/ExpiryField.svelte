<script lang="ts">
  import Field from 'ui/components/Field.svelte';

  import { Formatter } from 'formatter';
  import { createEventDispatcher } from 'svelte';

  // i18n
  import { t } from 'svelte-i18n';
  import { CARD_EXPIRY_HELP, EXPIRY_LABEL } from 'ui/labels/card';
  import { isRedesignV15 } from 'razorpay';

  export let value;
  export let ref = null;
  export let id;
  export let name;

  export let elemClasses;
  export let inputFieldClasses;
  export let labelClasses;
  export let labelUpperClasses;

  let valid = false;

  $: {
    if (ref) {
      ref.setValid(valid);
    }
  }

  const dispatch = createEventDispatcher();

  function handleInput(event) {
    value = event.target.value;
    onChange(event);
  }

  function onChange(event) {
    let isValid = Formatter.rules.expiry.isValid.call({
      value: ref.getRawValue() || '',
    });

    valid = isValid;
    if (!valid) {
      event.target.parentNode.classList.add('invalid');
    } else {
      event.target.parentNode.classList.remove('invalid');
    }

    if (isValid && value.length === ref.getCaretPosition()) {
      dispatch('filled');
    }
  }

  let expiryValidationError: boolean;

  export function isValid() {
    expiryValidationError = !valid;
    return valid;
  }
</script>

<Field
  {id}
  formatter={{ type: 'expiry' }}
  {name}
  placeholder="MM / YY"
  label={$t(EXPIRY_LABEL)}
  required
  validationText={isRedesignV15() && expiryValidationError
    ? $t(CARD_EXPIRY_HELP)
    : ''}
  {value}
  type="tel"
  autocomplete="cc-exp"
  maxlength={7}
  bind:this={ref}
  on:input={handleInput}
  on:input
  on:focus
  on:blur
  handleBlur
  handleFocus
  handleInput
  {elemClasses}
  {inputFieldClasses}
  {labelClasses}
  {labelUpperClasses}
  isInvalid={expiryValidationError}
/>
