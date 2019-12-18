<script>
  import Field from 'templates/views/ui/Field.svelte';
  import { getSession } from 'sessionmanager';

  export let value = session.get('prefill.name');
  export let ref = null;
  const session = getSession();

  let name_readonly =
    session.get('readonly.name') && session.get('prefill.name');

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
  handleInput
  readonly={name_readonly} />
