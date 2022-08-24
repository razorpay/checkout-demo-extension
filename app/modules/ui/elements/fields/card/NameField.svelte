<script lang="ts">
  import Field from 'ui/components/Field.svelte';

  import { isRedesignV15 } from 'razorpay';

  // utils import
  import { luhnCheck } from 'lib/utils';

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
    const isValidField = isValid();
    setValid(isValidField);
  }

  export function isValid() {
    try {
      let result = Boolean(value !== '');
      if (result) {
        helpTextToDisplay = '';
        const valueSansSpaces = value.split(' ').join('');
        /**
         * It was observed that users tend to input card number
         * here also
         */
        if (luhnCheck(valueSansSpaces) || !isNaN(Number(valueSansSpaces))) {
          result = false;
          helpTextToDisplay = $t(NAME_HELP);
        }
      } else {
        helpTextToDisplay = $t(NAME_HELP);
      }
      return result;
    } catch {
      return true;
    }
  }

  export function setValid(isValid) {
    ref?.setValid(isValid);
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
  validationText={isRedesignV15() && helpTextToDisplay}
/>
