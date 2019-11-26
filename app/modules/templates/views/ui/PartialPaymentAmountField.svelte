<script>
  import Field from 'templates/views/ui/Field.svelte';

  export let maxAmount = null;
  export let minAmount = null;
  export let amountPaid = null;
  export let value;

  // Refs
  let field;

  export function getValue() {
    return value;
  }

  export function focus() {
    field.focus();
  }

  function handleInput(event) {
    value = event.target.value;
  }

  function handleCheckboxChange(event) {
    if (event.target.checked) {
      value = minAmount / 100;
      // setTimeout(_ => field.input.dispatchEvent(new Event('input')));
    }
  }
</script>

<style>
  .minimum-amount-selection {
    display: flex;
    margin: 12px 0 0 0;
    align-items: center;

    .checkbox.inner-checkbox {
      margin-right: 8px;
    }
  }
</style>

<!-- TODO: format amount in helpText -->
<Field
  id="amount-value"
  name="amount"
  type="tel"
  {value}
  required
  placeholder="Enter amount"
  helpText="Please enter a valid contact amount upto {maxAmount}"
  formatter={{ type: 'amount' }}
  bind:this={field}
  handleFocus={true}
  handleBlur={true}
  handleInput={true}
  on:input={handleInput} />

{#if minAmount !== null && amountPaid === 0}
  <div class="minimum-amount-selection">
    <input
      type="checkbox"
      class="checkbox--square"
      id="minimum-amount-checkbox"
      on:change={handleCheckboxChange} />
    <div class="checkbox inner-checkbox" for="minimum-amount-checkbox" />
    <label class="partial-label" for="minimum-amount-checkbox">
      <!-- TODO: format amount -->
      Minimum Amount Due (₹{minAmount / 100})
    </label>
  </div>
{/if}
