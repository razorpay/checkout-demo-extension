<script>
  // UI imports
  import Field from 'ui/components/Field.svelte';
  import Tab from 'ui/tabs/Tab.svelte';

  // i18n
  import { t } from 'svelte-i18n';
  import {
    ACCOUNT_NUMBER_CONFIRM_HELP,
    ACCOUNT_NUMBER_CONFIRM_LABEL,
    ACCOUNT_NUMBER_HELP,
    ACCOUNT_NUMBER_LABEL,
    IFSC_HELP,
    IFSC_LABEL,
    NAME_HELP,
    NAME_LABEL,
  } from 'ui/labels/payouts';

  let accountNumberField;
  let confirmAccountNumberField;
  let ifscField;
  let nameField;

  let accountNumber;
  let confirmAccountNumber;
  let ifsc;
  let name;

  export function validateConfirmAccount() {
    if (accountNumber !== confirmAccountNumber) {
      confirmAccountNumberField.setValid(false);
    }
  }

  export function getPayload() {
    return {
      account_type: 'bank_account',
      bank_account: {
        account_number: accountNumber,
        name: name,
        ifsc: ifsc,
      },
    };
  }
</script>

<style>
  .fields-container {
    padding: 16px;
  }
</style>

<Tab
  method="payout_account"
  overrideMethodCheck={true}
  pad={false}
  shown={true}>
  <div class="fields-container">
    <Field
      type="text"
      name="account_number"
      id="account_number"
      placeholder={$t(ACCOUNT_NUMBER_LABEL)}
      helpText={$t(ACCOUNT_NUMBER_HELP)}
      maxlength="20"
      required={true}
      bind:this={accountNumberField}
      bind:readonlyValue={accountNumber}
      formatter={{ type: 'number' }}
      on:blur={validateConfirmAccount} />

    <Field
      type="text"
      name="account_number_confirm"
      id="account_number_confirm"
      placeholder={$t(ACCOUNT_NUMBER_CONFIRM_LABEL)}
      helpText={$t(ACCOUNT_NUMBER_CONFIRM_HELP)}
      maxlength="20"
      required={true}
      bind:this={confirmAccountNumberField}
      bind:readonlyValue={confirmAccountNumber}
      refresh={false}
      formatter={{ type: 'number' }}
      on:blur={validateConfirmAccount} />

    <Field
      type="text"
      name="ifsc"
      id="ifsc"
      placeholder={$t(IFSC_LABEL)}
      helpText={$t(IFSC_HELP)}
      maxlength="11"
      required={true}
      bind:this={ifscField}
      bind:readonlyValue={ifsc}
      formatter={{ type: 'ifsc' }} />

    <Field
      type="text"
      name="name"
      id="name"
      placeholder={$t(NAME_LABEL)}
      helpText={$t(NAME_HELP)}
      pattern={"^[a-zA-Z. 0-9']{1,100}$"}
      maxlength="100"
      required={true}
      bind:this={nameField}
      bind:readonlyValue={name} />
  </div>
</Tab>
