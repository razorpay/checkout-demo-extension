<script>
  import Field from 'ui/components/Field.svelte';

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
  label="IFSC"
  helpText="Please enter a valid IFSC"
  maxlength="11"
  required={true}
  formatter={{ type: 'alphanumeric' }}
  pattern={PATTERN}
  spellcheck="false"
  autocorrect="off"
  autocapitalize="off"
  handleBlur
  handleFocus
  handleInput
  on:input={handleInput} />
