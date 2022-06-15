<script lang="ts">
  import Field from 'ui/components/Field.svelte';

  import { PINCODE_HELP, PINCODE_LABEL } from 'ui/labels/home';
  import { t } from 'svelte-i18n';

  export let value;

  const PINCODE_PATTERN = '^\\d{6}$';

  function handleInput({ target }) {
    value = target.value;
  }
</script>

<!-- LABEL: PIN Code / Enter 6 digit pincode -->
<Field
  name="pincode"
  required={true}
  pattern={PINCODE_PATTERN}
  maxlength={6}
  helpText={$t(PINCODE_HELP)}
  label={$t(PINCODE_LABEL)}
  on:input={handleInput}
  {value}
  handleFocus={true}
  handleBlur={true}
  handleInput={true}
/>
