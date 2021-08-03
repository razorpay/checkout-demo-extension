<script>
  // UI
  import Field from 'ui/components/Field.svelte';

  // Utils
  import { getBankLogo } from 'common/bank';

  // i18n
  import { t } from 'svelte-i18n';
  import {
    ACCOUNT_NUMBER_LABEL,
    ACCOUNT_NUMBER_HELP,
  } from 'ui/labels/emandate';

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

<div class="account-number-field">
  {#if bankCode}
    <div class="bank-icon"><img src={getBankLogo(bankCode)} alt="" /></div>
  {/if}

  <Field
    type="text"
    {name}
    {id}
    {readonly}
    {value}
    label={$t(ACCOUNT_NUMBER_LABEL)}
    helpText={$t(ACCOUNT_NUMBER_HELP)}
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
    on:input={handleInput}
  />
</div>

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
