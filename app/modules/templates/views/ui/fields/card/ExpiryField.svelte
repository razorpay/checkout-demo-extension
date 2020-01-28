<script>
  import Field from 'templates/views/ui/Field.svelte';

  import { Formatter } from 'formatter';
  import { createEventDispatcher } from 'svelte';

  export let value;
  export let ref = null;
  export let id;

  const dispatch = createEventDispatcher();

  function handleInput(event) {
    value = event.target.value;
    onChange();
  }

  function onChange() {
    let isValid = Formatter.rules.expiry.isValid.call({
      value: ref.getRawValue() || '',
    });
    ref.setValid(isValid);
    if (isValid && value.length === ref.getCaret()) {
      dispatch('filled');
    }
  }
</script>

<Field
  {id}
  formatter={{ type: 'expiry' }}
  name="card[expiry]"
  placeholder="MM / YY"
  label="Expiry"
  required
  {value}
  type="tel"
  maxlength={7}
  bind:this={ref}
  on:input={handleInput}
  handleBlur
  handleFocus
  handleInput />
