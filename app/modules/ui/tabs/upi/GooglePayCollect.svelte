<script lang="ts">
  // Svelte imports
  import { createEventDispatcher, onMount } from 'svelte';

  // UI imports
  import Field from 'ui/components/Field.svelte';
  import Card from 'ui/elements/Card.svelte';

  // Props
  export let retry = false;
  export let selected = true;
  export let pspHandle;
  export let focusOnCreate;

  // Refs
  export let vpaField = null;
  export let googlePayPspHandle = null;

  let vpaValue;

  const dispatch = createEventDispatcher();

  onMount(() => {
    if (focusOnCreate) {
      focus();
    }
  });

  export function handleCardClick(event) {
    const target = event && event.target;

    // Don't focus on VPA input if the dropdown elem was clicked.
    if (target === googlePayPspHandle) {
      return;
    }

    signalSelect();
    vpaField.focus();
  }

  export function signalSelect() {
    dispatch('select', {
      type: 'vpa',
    });
  }

  export function handlePspChange(event) {
    focus();
    dispatch('handleChange', event.target.value);
  }

  export function getVpa() {
    return `${vpaValue}@${pspHandle}`;
  }

  export function focus() {
    signalSelect();
    vpaField.focus();
  }

  export function blur() {
    vpaField.blur();
  }
</script>

<div class="legend left" style="margin-top: 18px">
  {retry ? 'Or' : ''}
  Enter your UPI ID
</div>

<div id="upi-gpay-vpa" class="upi-gpay">
  <Card {selected} on:click={handleCardClick}>
    <div class="elem-wrap collect-form">
      <!-- TODO: remove all non svelte css for this -->
      <Field
        type="text"
        formatter={{ type: 'vpa' }}
        on:blur={blur}
        helpText="Please enter a valid handle"
        id="vpa"
        name="vpa"
        pattern=".+"
        placeholder="Enter UPI ID"
        required={true}
        on:focus={focus}
        bind:this={vpaField}
        bind:readonlyValue={vpaValue}
      />
      <div class="elem at-separator">@</div>
      <div class="elem" style="padding-right:20px;">
        <select
          class="input"
          name="gpay_bank"
          required
          on:change={handlePspChange}
          bind:this={googlePayPspHandle}
          bind:value={pspHandle}
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
