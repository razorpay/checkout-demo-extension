<script>
  import Field from 'templates/views/ui/Field.svelte';
  import { getSession } from 'sessionmanager';

  export let value = session.get('prefill.name');
  export let ref = null;
  export let id;
  export let name;
  export let readonly = false;

  const NAME_PATTERN = "^[a-zA-Z. 0-9'-]{1,100}$";

  function handleInput(event) {
    value = event.target.value;
  }
</script>

<Field
  helpText="Please enter name on your card"
  {id}
  {name}
  label="Card Holder's name"
  pattern={NAME_PATTERN}
  required
  type="text"
  {value}
  on:input={handleInput}
  bind:this={ref}
  handleBlur
  handleFocus
  handleInput
  {readonly} />
