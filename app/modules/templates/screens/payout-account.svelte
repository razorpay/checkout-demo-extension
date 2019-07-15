<div id="form-payout_account" class="tab-content showable screen">

  <div class="fields-container">

    <Field
      type="text"
      name="account_number"
      id='account_number'
      placeholder="Account number"
      helpText="Please enter a valid account number"
      pattern=".+"
      required={true}
    />

    <Field
      type="text"
      name="account_number_confirm"
      id='account_number_confirm'
      placeholder="Re-enter account number"
      helpText="Please enter a valid account number"
      pattern=".+"
      required={true}
    />

    <Field
      type="text"
      name="ifsc"
      id='ifsc'
      placeholder="IFSC"
      helpText="Please enter a valid IFSC"
      pattern=".+"
      required={true}
    />

    <Field
      type="text"
      name="name"
      id='name'
      placeholder="Account holder name"
      helpText="Please enter a valid account name"
      pattern=".+"
      required={true}
    />

  </div>

</div>

<style>

.fields-container {
  padding: 16px;
}

</style>

<script>

export default {

  components: {
    Field: 'templates/views/ui/Field.svelte'
  },

}

</script>
