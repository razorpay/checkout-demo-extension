<script>
  // UI
  import Field from 'ui/components/Field.svelte';

  // Utils
  import { getBankLogo } from 'common/bank';

  export let id;
  export let name;
  export let readonly;

  export let bankCode;

  export let value;

  const PATTERN = '^[a-zA-Z0-9]{4,20}$';

  function handleInput(event) {
    value = event.target.value;
  }
</script>

<style>
  .account-number-field {
    position: relative;
  }

  .bank-icon {
    position: absolute;
    right: 0;
    top: 24px;
    width: 18px;
    height: 18px;
  }

  .bank-icon img {
    max-width: 100%;
    max-height: 100%;
  }
</style>

<div class="account-number-field">
  {#if bankCode}
    <div class="bank-icon">
      <img src={getBankLogo(bankCode)} />
    </div>
  {/if}

  <Field
    type="text"
    {name}
    {id}
    {readonly}
    {value}
    label="Bank Account Number"
    helpText="Please enter a valid account number"
    maxlength="20"
    required={true}
    formatter={{ type: 'alphanumeric' }}
    pattern={PATTERN}
    spellcheck="false"
    autocorrect="off"
    autocapitalize="off"
    handleBlur
    handleFocus
    handleInput
    on:input={handleInput} />

</div>
