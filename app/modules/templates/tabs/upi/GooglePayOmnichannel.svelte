<div class="legend left">
  Enter your Mobile Number
</div>

<div id="upi-gpay-phone" class="upi-gpay">
  <Card
    {selected}
    on:click="handleCardClick()"
    error="{selected && error && isFirst}"
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
        on:blur="blur(event)"
        on:focus="focus(event)"
      />
    </div>
  </Card>
</div>

{#if selected}
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
  .upi-gpay {
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
  import { getSession } from 'sessionmanager';

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
        this.signalSelect();
        this.focus();
      },
      signalSelect() {
        this.fire('select', {
          type: 'phone'
        });
      },
      getPhone() {
        return this.refs.phoneField.getValue();
      },
      focus(event) {
        this.signalSelect();
        this.refs.phoneField.focus();
        this.fire('focus', event);
      },
      blur(event) {
        this.refs.phoneField.blur();
        this.fire('blur', event);
      },
    },
  };
</script>
