<div class="legend left">
  Enter your Mobile Number
</div>

<div id="upi-gpay">
  <Card {checked} radioValue={retry?'phone':null} selected="{true}" on:click="focus()">
    <div class="elem-wrap collect-form">
      <Field
        type="text"
        name="phone"
        id='phone'
        ref:phoneField
        placeholder=""
        disabled={checked}
        helpText="Please enter a valid phone number"
        required={true}
        formatter={{
          type: 'number'
        }}
        maxlength="{10}"
        on:blur
        on:focus
    />
    </div>
  </Card>
</div>

{#if error}
  <p class="error">
    Please ensure the same number is linked to the Google Pay account.
  </p>
{:else}
  <p class="info">
    You will receive a notification from Razorpay, in the Google Pay app.
  </p>
{/if}

<style>
  #upi-gpay {
    display: block;
  }

  .legend {
    margin-top: 18px;
  }

  .info {
    font-size: 12px;
    color: rgb(117, 117, 117);
  }

  .error {
    font-size: 12px;
    margin-top: 18px;
    color: red;
  }

</style>

<script>

export default {
  components: {
    Field: 'templates/views/ui/Field.svelte',
    Card: 'templates/views/ui/Card.svelte',
  },

  data() {
    return {
      focusOnCreate: false,
      error: false,
      retry:false,
      checked:true
    }
  },

  oncreate() {
    const { focusOnCreate } = this.get();
    if (focusOnCreate) {
      this.focus();
    }
  },

  methods: {
    handleCardClick(event) {
      this.refs.phoneField.focus();
    },
    getPhone() {
      return this.refs.phoneField.getValue();
    },
    focus() {
      this.refs.phoneField.focus();
    },
    blur() {
      this.refs.phoneField.blur();
    }
  },

}

</script>

