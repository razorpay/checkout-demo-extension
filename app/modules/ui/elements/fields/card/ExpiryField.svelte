<script>
  import Field from 'ui/components/Field.svelte';

  import { Formatter } from 'formatter';
  import { createEventDispatcher } from 'svelte';

  // i18n
  import { t } from 'svelte-i18n';
  import { EXPIRY_LABEL } from 'ui/labels/card';

  export let value;
  export let ref = null;
  export let id;
  export let name;

  let valid = false;

  $: {
    if (ref) {
      ref.setValid(valid);
    }
  }

  const dispatch = createEventDispatcher();

  function handleInput(event) {
    value = event.target.value;
    onChange(event);
  }

  function onChange(event) {
    let isValid = Formatter.rules.expiry.isValid.call({
      value: ref.getRawValue() || '',
    });

    valid = isValid;
    if (!valid) {
      event.target.parentNode.classList.add('invalid');
    } else {
      event.target.parentNode.classList.remove('invalid');
    }

    if (isValid && value.length === ref.getCaretPosition()) {
      dispatch('filled');
    }
  }

  export function isValid() {
    return valid;
  }
</script>

<Field
  {id}
  formatter={{ type: 'expiry' }}
  {name}
  placeholder="MM / YY"
  label={$t(EXPIRY_LABEL)}
  required
  {value}
  type="tel"
  autocomplete="cc-exp"
  maxlength={7}
  bind:this={ref}
  on:input={handleInput}
  on:focus
  on:blur
  handleBlur
  handleFocus
  handleInput
/>
