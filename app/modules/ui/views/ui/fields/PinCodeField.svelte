<script>
  import Field from 'ui/views/ui/Field.svelte';

  export let value;

  const PINCODE_PATTERN = '^\\d{6}$';

  function handleInput({ target }) {
    value = target.value;
  }
</script>

<Field
  name="pincode"
  required={true}
  pattern={PINCODE_PATTERN}
  maxlength={6}
  helpText="Enter 6 digit pincode"
  label="PIN Code"
  on:input={handleInput}
  {value}
  handleFocus={true}
  handleBlur={true}
  handleInput={true} />
