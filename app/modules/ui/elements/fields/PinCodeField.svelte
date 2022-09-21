<script lang="ts">
  import Field from 'ui/components/Field.svelte';

  import { PINCODE_HELP, PINCODE_LABEL } from 'ui/labels/home';
  import { t } from 'svelte-i18n';
  import { isRedesignV15 } from 'razorpay';

  export let value: string;
  export let isInvalid = false;

  const PINCODE_PATTERN = '^\\d{6}$';

  function handleInput({ target }) {
    value = target.value;
  }
</script>

<!-- LABEL: PIN Code / Enter 6 digit pincode -->
<Field
  name="pincode"
  id="pincode"
  required={true}
  pattern={PINCODE_PATTERN}
  maxlength={6}
  helpText={$t(PINCODE_HELP)}
  label={$t(PINCODE_LABEL)}
  on:input={handleInput}
  {value}
  handleFocus={!isRedesignV15()}
  handleBlur={true}
  handleInput={true}
  validationText={$t(PINCODE_HELP)}
  on:blur={() => {
    isInvalid = !value || !new RegExp(PINCODE_PATTERN).test(value);
  }}
  bind:showValidations={isInvalid}
/>
