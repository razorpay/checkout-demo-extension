<script>
  import Field from 'ui/components/Field.svelte';

  import { t } from 'svelte-i18n';
  import { IFSC_LABEL, IFSC_HELP } from 'ui/labels/emandate';

  export let id;
  export let name;
  export let readonly;

  export let value;

  const PATTERN = '^[a-zA-Z]{4}[a-zA-Z0-9]{7}$';

  function handleInput(event) {
    value = event.target.value;
  }
</script>

<Field
  type="text"
  {name}
  {id}
  {readonly}
  {value}
  label={$t(IFSC_LABEL)}
  helpText={$t(IFSC_HELP)}
  maxlength="11"
  required={true}
  formatter={{ type: 'ifsc' }}
  pattern={PATTERN}
  spellcheck="false"
  autocorrect="off"
  autocapitalize="off"
  handleBlur
  handleFocus
  handleInput
  on:input={handleInput} />
