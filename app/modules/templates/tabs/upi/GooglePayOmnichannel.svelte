<div class="legend left">
  Enter your Mobile Number
</div>

<div id="upi-gpay-phone" class="upi-gpay">
  <Card
    selected="{radio.phone}"
    on:click="focus()"
    error="{radio.phone && error && isFirst}"
  >
    <div class="elem-wrap collect-form">
      <Field 
      type="text" 
      name="phone" 
      id='phone' 
      ref:phoneField
      placeholder="Enter Mobile Number" 
      formatter={{ type: 'number' }}
      required={true} 
      helpText="Please enter a valid contact no."
      maxlength="{10}" 
      value={contact} 
      on:blur="blur()" 
      on:focus="focus()" />
    </div>
    {#if retry} 
    <input on:change="radioChange(event)" {checked}
    ref:radioInpPhone value={retry?'phone':null} type="radio" name="isSelected"
    helpText="Please enter a valid handle"
    id="pay-radio"
    /> 
    {/if}
  </Card>
</div>

{#if radio.phone} 
{#if error}
<p class:regular="!isFirst" class:error="isFirst">
  Please ensure the same number is linked to the Google Pay account.
</p>
{:else}
<p class="info">
  You will receive a notification from Razorpay, in the Google Pay app.
</p>
{/if} 
{/if}

<style>
  #upi-gpay-phone,
  #upi-gpay-vpa {
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
  import { getSession } from 'sessionmanager.js';

  export default {
    components: {
      Field: 'templates/views/ui/Field.svelte',
      Card: 'templates/views/ui/Card.svelte',
    },

    data() {
      return {
        focusOnCreate: false,
        error: false,
        isFirst: true,
        contact: null,
        selected: true,
        radio: {
          phone: true,
          vpa: false,
        },
        retry: false,
        checked: true,
      };
    },

    oncreate() {
      this.set({
        contact: getSession().customer.contact.replace('+91', ''),
      });
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
        if (this.refs.radioInpPhone) {
          this.refs.radioInpPhone.checked = true;
          this.radioChange({
            target: {
              checked: true,
              value: 'phone',
            },
          });
        }
      },
      blur() {
        this.refs.phoneField.blur();
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
