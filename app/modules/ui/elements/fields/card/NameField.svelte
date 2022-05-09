<script>
  import Field from 'ui/components/Field.svelte';

  import { isOneClickCheckout } from 'razorpay';

  // i18n
  import { t } from 'svelte-i18n';
  import { NAME_LABEL, NAME_HELP } from 'ui/labels/card';

  export let value = '';
  export let ref = null;
  export let id;
  export let name;
  export let readonly = false;

  export let elemClasses;
  export let inputFieldClasses;
  export let labelClasses;
  export let labelUpperClasses;

  const NAME_PATTERN = "^[a-zA-Z. 0-9'-]{1,100}$";

  let helpTextToDisplay;

  function handleInput(event) {
    value = event.target.value;
  }

  export function isValid() {
    const result = Boolean(value !== '');
    helpTextToDisplay = result ? undefined : $t(NAME_HELP);
    return result;
  }
</script>

<Field
  helpText={$t(NAME_HELP)}
  {id}
  {name}
  label={$t(NAME_LABEL)}
  pattern={NAME_PATTERN}
  required
  type="text"
  autocomplete="cc-name"
  {value}
  on:input={handleInput}
  on:blur
  on:focus
  bind:this={ref}
  handleBlur
  handleFocus
  handleInput
  {readonly}
  {elemClasses}
  {inputFieldClasses}
  {labelClasses}
  {labelUpperClasses}
  validationText={isOneClickCheckout() && helpTextToDisplay}
/>
