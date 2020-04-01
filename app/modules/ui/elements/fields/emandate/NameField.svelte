<script>
  import Field from 'ui/components/Field.svelte';

  export let id;
  export let name;
  export let readonly;

  const PATTERN = "^[a-zA-Z. 0-9\\']{1,100}$";
</script>

<Field
  type="text"
  {name}
  {id}
  {readonly}
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
  handleInput />
