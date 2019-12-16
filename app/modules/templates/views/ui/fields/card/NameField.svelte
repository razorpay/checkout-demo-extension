<script>
  import Field from 'templates/views/ui/Field.svelte';

  export let value = '';
  export let ref = null;

  const NAME_PATTERN = "^[a-zA-Z. 0-9'-]{1,100}$";

  function handleInput(event) {
    value = event.target.value;
  }
</script>

<Field
  helpText="Please enter name on your card"
  id="card_name"
  name="card[name]"
  label="Card Holder's name"
  pattern={NAME_PATTERN}
  required
  type="text"
  {value}
  on:input={handleInput}
  bind:this={ref}
  handleBlur
  handleFocus
  handleInput />
