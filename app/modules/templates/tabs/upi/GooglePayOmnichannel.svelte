<script>
  // Svelte imports
  import { createEventDispatcher, onMount } from 'svelte';

  // Util imports
  import { getSession } from 'sessionmanager';

  // UI imports
  import Field from 'templates/views/ui/Field.svelte';
  import Card from 'templates/views/ui/Card.svelte';

  // Props
  export let selected = true;
  export let error = false;
  export let isFirst = true;
  export let contact = null;
  export let focusOnCreate = false;
  export let retry = false;
  export let checked = true;

  // Refs
  export let phoneField = null;

  const dispatch = createEventDispatcher();
  const session = getSession();

  onMount(() => {
    contact = session.customer.contact.replace('+91', '');
    if (focusOnCreate) {
      focus();
    }
  });

  export function handleCardClick(event) {
    signalSelect();
    focus();
  }

  export function signalSelect() {
    dispatch('select', {
      type: 'phone',
    });
  }

  export function getPhone() {
    return phoneField.getValue();
  }

  export function focus() {
    signalSelect();
    phoneField.focus();
    dispatch('focus');
  }

  export function blur(event) {
    phoneField.blur();
    dispatch('blur', event.detail);
  }
</script>

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

<div class="legend left">Enter your Mobile Number</div>

<div id="upi-gpay-phone" class="upi-gpay">
  <Card
    {selected}
    on:click={handleCardClick}
    error={selected && error && isFirst}>
    <div class="elem-wrap collect-form">
      <Field
        type="text"
        name="phone"
        id="phone"
        bind:this={phoneField}
        placeholder="Enter Mobile Number"
        formatter={{ type: 'number' }}
        required={true}
        helpText="Please enter a valid contact no."
        maxlength={10}
        value={contact}
        on:blur={blur}
        on:focus={focus} />
    </div>
  </Card>
</div>

{#if selected}
  {#if error}
    <p class:regular={!isFirst} class:error={isFirst}>
      Please ensure the same number is linked to the Google Pay account.
    </p>
  {:else}
    <p class="info">
      You will receive a notification from Razorpay, in the Google Pay app.
    </p>
  {/if}
{/if}
