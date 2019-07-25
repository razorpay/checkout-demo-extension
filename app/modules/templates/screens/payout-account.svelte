<Tab method="payout_account" overrideMethodCheck="{true}" pad="{false}">

  <div class="fields-container">

    <Field
      type="text"
      name="account_number"
      id='account_number'
      placeholder="Account number"
      helpText="Please enter a valid account number"
      maxlength="20"
      required={true}
      ref:accountNumberField
      formatter={{
        type: 'number'
      }}

      on:blur="validateConfirmAccount()"
    />

    <Field
      type="text"
      name="account_number_confirm"
      id='account_number_confirm'
      placeholder="Re-enter account number"
      helpText="Please confirm the account number"
      maxlength="20"
      required={true}
      ref:confirmAccountNumberField
      refresh="{false}"
      formatter={{
        type: 'number'
      }}

      on:blur="validateConfirmAccount()"
    />

    <Field
      type="text"
      name="ifsc"
      id='ifsc'
      placeholder="IFSC"
      helpText="Please enter a valid IFSC"
      pattern={"^[a-zA-Z]{4}[a-zA-Z0-9]{7}$"}
      maxlength="11"
      required={true}
      formatter={{
        type: 'ifsc'
      }}
    />

    <Field
      type="text"
      name="name"
      id='name'
      placeholder="Account holder name"
      helpText="Please enter a valid account name"
      pattern={"^[a-zA-Z. 0-9\']{1,100}$"}
      maxlength="100"
      required={true}
    />

  </div>

</Tab>

<style>

.fields-container {
  padding: 16px;
}

</style>

<script>

export default {

  data() {
    return {
      confirmInvalid: false
    }
  },

  components: {
    Field: 'templates/views/ui/Field.svelte',
    Tab: 'templates/tabs/Tab.svelte',
  },

  methods: {
    validateConfirmAccount() {
      const value = this.refs.accountNumberField.getValue();
      const confirmValue = this.refs.confirmAccountNumberField.getValue();
      if (value !== confirmValue) {
        this.refs.confirmAccountNumberField.refs.wrap.classList.add('invalid');
      }
    }
  }

}

</script>
