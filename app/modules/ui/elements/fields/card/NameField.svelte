<script>
  import Field from 'ui/components/Field.svelte';

  export let value = '';
  export let ref = null;
  export let id;
  export let name;
  export let readonly = false;

  const NAME_PATTERN = "^[a-zA-Z. 0-9'-]{1,100}$";

  function handleInput(event) {
    value = event.target.value;
  }

  export function isValid() {
    return value !== '';
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
  on:blur
  bind:this={ref}
  handleBlur
  handleFocus
  handleInput
  {readonly} />
