<script>
  import Field from 'templates/views/ui/Field.svelte';

  export let value;
  export let type = '';

  function handleInput(event) {
    value = event.target.value;
  }
</script>

<!-- TODO: fix label overlapping placeholder  -->
<Field
  formatter={{ type: 'expiry' }}
  id="card[expiry]"
  name="card[expiry]"
  placeholder="MM / YY"
  label="Expiry"
  required
  {value}
  {type}
  maxlength={7}
  on:input={handleInput}
  handleBlur
  handleFocus
  handleInput />
