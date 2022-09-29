<script lang="ts">
  import Field from 'ui/components/Field.svelte';

  import { t } from 'svelte-i18n';
  import { NAME_LABEL, NAME_HELP } from 'ui/labels/emandate';

  export let id;
  export let name;
  export let readonly;
  export let dir;
  export let value;
  let showValidations = false;
  let validationText = $t(NAME_HELP);

  const PATTERN = "^[a-zA-Z. 0-9\\']{1,100}$";

  function handleInput(event) {
    value = event.target.value;
  }
  function handleInputBlur() {
    showValidations = !value;
  }
</script>

<Field
  type="text"
  labelClasses="fs-12"
  {name}
  {id}
  {readonly}
  {value}
  {dir}
  label={$t(NAME_LABEL)}
  helpText={$t(NAME_HELP)}
  {validationText}
  maxlength="100"
  required={true}
  pattern={PATTERN}
  spellcheck="false"
  autocorrect="off"
  autocapitalize="off"
  handleBlur
  handleInput
  on:input={handleInput}
  on:blur={handleInputBlur}
  bind:showValidations
/>
