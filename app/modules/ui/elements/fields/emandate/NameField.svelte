<script>
  import Field from 'ui/components/Field.svelte';

  export let id;
  export let name;
  export let readonly;

  export let value;

  const PATTERN = "^[a-zA-Z. 0-9\\']{1,100}$";

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
  label="IFSC"
  helpText="Please enter a valid Name as per your account"
  maxlength="100"
  required={true}
  pattern={PATTERN}
  spellcheck="false"
  autocorrect="off"
  autocapitalize="off"
  handleBlur
  handleFocus
  handleInput
  on:input={handleInput} />
