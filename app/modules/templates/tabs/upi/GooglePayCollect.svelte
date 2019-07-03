<div class="legend left" style="margin-top: 18px">
  Enter your UPI ID
</div>
<div id="upi-gpay">
  <Card selected="{true}" on:click="handleCardClick(event)">
    <div class="elem-wrap collect-form">
      <!-- TODO: remove all non svelte css for this -->
      <Field
        type="text"
        name="vpa"
        id='vpa'
        ref:vpaField
        placeholder="Enter UPI ID"
        helpText="Please enter a valid handle"
        pattern=".+"
        required={true}
        formatter={{
          type: 'vpa'
        }}
        on:blur
      />
      <div class="elem at-separator">@</div>
      <div class="elem">
        <select
          required
          class="input"
          name="gpay_bank"
          ref:googlePayPspHandle
          bind:value="pspHandle"
          on:change="handlePspChange(event)">
          <option value="">Select Bank</option>
          <option value="okhdfcbank">okhdfcbank</option>
          <option value="okicici">okicici</option>
          <option value="oksbi">oksbi</option>
          <option value="okaxis">okaxis</option>
        </select>
      </div>
    </div>
  </Card>
</div>

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

  oncreate() {
    this.focus();
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

