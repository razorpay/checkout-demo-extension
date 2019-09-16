<script>
  // UI imports
  import Field from 'templates/views/ui/Field.svelte';
  import Tab from 'templates/tabs/Tab.svelte';

  // Props
  export let confirmInvalid = false;

  // Refs
  export let accountNumberField;
  export let confirmAccountNumberField;

  export function validateConfirmAccount() {
    const value = accountNumberField.getValue();
    const confirmValue = confirmAccountNumberField.getValue();
    if (value !== confirmValue) {
      confirmAccountNumberField.setInvalid();
    }
  }
</script>

<style>
  .fields-container {
    padding: 16px;
  }
</style>

<Tab method="payout_account" overrideMethodCheck={true} pad={false}>

  <div class="fields-container">

    <Field
      type="text"
      name="account_number"
      id="account_number"
      placeholder="Account number"
      helpText="Please enter a valid account number"
      maxlength="20"
      required={true}
      bind:this={accountNumberField}
      formatter={{ type: 'number' }}
      on:blur={validateConfirmAccount} />

    <Field
      type="text"
      name="account_number_confirm"
      id="account_number_confirm"
      placeholder="Re-enter account number"
      helpText="Please confirm the account number"
      maxlength="20"
      required={true}
      bind:this={confirmAccountNumberField}
      refresh={false}
      formatter={{ type: 'number' }}
      on:blur={validateConfirmAccount} />

    <Field
      type="text"
      name="ifsc"
      id="ifsc"
      placeholder="IFSC"
      helpText="Please enter a valid IFSC"
      maxlength="11"
      required={true}
      formatter={{ type: 'ifsc' }} />

    <Field
      type="text"
      name="name"
      id="name"
      placeholder="Account holder name"
      helpText="Please enter a valid account name"
      pattern={"^[a-zA-Z. 0-9']{1,100}$"}
      maxlength="100"
      required={true} />

  </div>

</Tab>
