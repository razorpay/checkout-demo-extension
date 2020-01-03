<script>
  import Field from 'templates/views/ui/Field.svelte';
  import { getSession } from 'sessionmanager';
  import { Formatter } from 'formatter';
  import { createEventDispatcher } from 'svelte';

  export let value;
  export let type = '';
  export let ref = null;

  const dispatch = createEventDispatcher();
  const session = getSession();
  let formatterObj = null;

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
  formatter={{ type: 'expiry' }}
  id="card[expiry]"
  name="card[expiry]"
  placeholder="MM / YY"
  label="Expiry"
  required
  {value}
  {type}
  maxlength={7}
  bind:this={ref}
  on:input={handleInput}
  handleBlur
  handleFocus
  handleInput />
