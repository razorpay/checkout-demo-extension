<script>
  import { createEventDispatcher } from 'svelte';

  import Field from 'templates/views/ui/Field.svelte';
  import Icon from 'templates/views/ui/Icon.svelte';

  import { getIcon } from 'icons/network';

  export let value = '';
  export let type = null;

  const dispatch = createEventDispatcher();

  export function onShown() {}

  export function getType() {
    return type;
  }

  function handleInput(e) {
    value = e.target.value;
  }

  function handleNetwork(data) {
    dispatch('network', { type });
    // TODO: check what amex, maestro and noamex classes do
    // update cvv element
    // var cvvlen = type !== 'amex' ? 3 : 4;
    // el_cvv.maxLength = cvvlen;
    // el_cvv.pattern = '^[0-9]{' + cvvlen + '}$';
    // $(el_cvv)
    //   .toggleClass('amex', type === 'amex')
    //   .toggleClass('maestro', type === 'maestro');
    //
    // if (!preferences.methods.amex && type === 'amex') {
    //   $('#elem-card').addClass('noamex');
    // } else {
    //   $('#elem-card').removeClass('noamex');
    // }
  }
</script>

<style>
  .field-container {
    position: relative;
  }

  .icon {
    position: absolute;
    right: 4px;
    top: 32px;
    width: 24px;
  }
</style>

<div class="field-container">
  {#if type}
    <div class="icon">
      <Icon icon={getIcon(type)} />
    </div>
  {/if}
  <!-- TODO: set maxlength based on type or remove from here if already handled by formatter -->
  <!-- TODO: handle prefill and readonly -->
  <Field
    formatter={{ type: 'card', on: { network: handleNetwork } }}
    helpText="Please enter your card number"
    name="card[number]"
    required={true}
    {value}
    type="tel"
    autocomplete="off"
    label="Card Number"
    handleBlur
    handleFocus
    handleInput
    maxlength={19}
    on:input={handleInput} />
</div>
