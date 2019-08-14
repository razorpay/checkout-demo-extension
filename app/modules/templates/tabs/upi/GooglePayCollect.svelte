<div class="legend left" style="margin-top: 18px">
  {retry ? 'Or' : ''} Enter your UPI ID
</div>

<div id="upi-gpay-vpa" class="upi-gpay">
  <Card
    {selected}
    on:click="handleCardClick(event)"
  >
    <div class="elem-wrap collect-form">
      <!-- TODO: remove all non svelte css for this -->
      <Field type="text"
        formatter={{ type: 'vpa' }} on:blur="blur()"
        helpText="Please enter a valid handle"
        id='vpa'
        name="vpa"
        pattern=".+"
        placeholder="Enter UPI ID"
        required={true}

        on:focus="focus()"
        ref:vpaField
      />
      <div class="elem at-separator">@</div>
      <div class="elem" style="padding-right:20px;">
        <select
          class="input"
          name="gpay_bank"
          required

          on:change="handlePspChange(event)"
          ref:googlePayPspHandle
          bind:value="pspHandle"
        >
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
  .upi-gpay {
    display: block;
  }
</style>

<script>
  import { getSession } from 'sessionmanager.js';

  export default {
    components: {
      Field: 'templates/views/ui/Field.svelte',
      Card: 'templates/views/ui/Card.svelte',
    },
    data() {
      return {
        retry: false,
        selected: true,
        checked: false,
      };
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

        this.fire('select', {
          type: 'vpa'
        });

        this.refs.vpaField.focus();
      },
      handlePspChange(event) {
        this.focus();
        const session = getSession();
        this.fire('handleChange', event.target.value);
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
      },
    },
  };
</script>
