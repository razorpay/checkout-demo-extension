<div class="legend left" style="margin-top: 18px">
  Enter your Mobile Number
</div>
<div id="upi-gpay">
  <Card selected="{true}" on:click>
    <div class="elem-wrap collect-form">
      <Field
        type="text"
        name="phone"
        id='phone'
        ref:phoneField
        placeholder=""
        helpText="Please enter a valid phone number"
        required={true}
        formatter={{
          type: 'number'
        }}
        on:blur
      />
    </div>
  </Card>
</div>
<p class="left">
  You will receive a notification from the Google Pay app.
</p>

<style>
  #upi-gpay {
    display: block;
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
      focusOnCreate: false
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
      const target = event && event.target;
      const { googlePayPspHandle } = this.refs;

      // Don't focus on VPA input if the dropdown elem was clicked.
      if (target === googlePayPspHandle) {
        return;
      }

      this.refs.vpaField.focus();
    },
    handlePspChange(event) {
      this.focus();
      this.fire('handleChange', event.target.value)
    },
    getVpa() {
      const { pspHandle } = this.get();
      return `${this.refs.vpaField.getValue()}@${pspHandle}`;
    },
    focus() {
      this.refs.vpaField.focus();
    },
    blur() {
      this.refs.vpaField.blur();
    }
  },

}

</script>

