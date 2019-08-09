<div class="legend left" style="margin-top: 18px">
  {retry ? 'Or' : ''} Enter your UPI ID
</div>

<div id="upi-gpay-vpa">
  <Card 
  selected="{radio.vpa}" 
  on:click="handleCardClick(event)">
    <div class="elem-wrap collect-form">
      <!-- TODO: remove all non svelte css for this -->
      <Field type="text" 
      name="vpa" 
      id='vpa' 
      ref:vpaField
       placeholder="Enter UPI ID" 
       helpText="Please enter a valid handle" 
       pattern=".+" 
       required={true}
      formatter={{ type: 'vpa' }} on:blur="blur()" 
      on:focus="focus()" />
      <div class="elem at-separator">@</div>
      <div class="elem" style="padding-right:20px;">
        <select
          required
          class="input"
          name="gpay_bank"
          ref:googlePayPspHandle
          bind:value="pspHandle"
          on:change="handlePspChange(event)"
        >
          <option value="">Select Bank</option>
          <option value="okhdfcbank">okhdfcbank</option>
          <option value="okicici">okicici</option>
          <option value="oksbi">oksbi</option>
          <option value="okaxis">okaxis</option>
        </select>
      </div>
      {#if retry} <input on:change="radioChange(event)" {checked}
      ref:radioInpVpa value={retry?'vpa':null} type="radio" name="isSelected"
      class="radio-change"
      /> {/if}
    </div>
  </Card>
</div>

<style>
  #upi-gpay-contact,
  #upi-gpay-vpa {
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
        radio: {
          phone: true,
          vpa: false,
        },
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
        if (this.refs.radioInpVpa) {
          this.refs.radioInpVpa.checked = true;
          this.radioChange({
            target: {
              checked: true,
              value: 'vpa',
            },
          });
        }
      },
      blur() {
        this.refs.vpaField.blur();
      },
      radioChange(e) {
        this.fire('radiochange');
        const session = getSession();
        const checked = e.target.checked;
        this.set({ checked: checked });
        const val = e.target.value;
        session.upiTab.set({
          omniSelected: val,
        });
      },
    },
  };
</script>
