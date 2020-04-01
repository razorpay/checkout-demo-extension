<script>
  import Field from 'ui/components/Field.svelte';

  export let id;
  export let name;
  export let readonly;

  export let bankCode;

  export let value;

  const PATTERN = '^[a-zA-Z0-9]{4,20}$';

  function handleInput(event) {
    value = event.target.value;
  }
</script>

<Field
  type="text"
  {name}
  {id}
  {readonly}
  label="Bank Account Number"
  helpText="Please enter a valid account number"
  maxlength="20"
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
