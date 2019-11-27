<script>
  import Field from 'templates/views/ui/Field.svelte';

  import { getSession } from 'sessionmanager';

  export let maxAmount = null;
  export let minAmount = null;
  export let amountPaid = null;
  export let value;

  const session = getSession();

  // Refs
  let field;

  // Computed
  let valueInLower;

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
    } else {
      value = '';
    }
  }

  $: valueInLower = value * 100;

  $: {
    if (value) {
      if (valueInLower >= minAmount && valueInLower <= maxAmount) {
        session.setAmount(value * 100);
      }
    } else {
      session.setAmount(maxAmount);
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
  helpText="Please enter a valid amount upto {maxAmount}"
  formatter={{ type: 'amount' }}
  bind:this={field}
  handleFocus={true}
  handleBlur={true}
  handleInput={true}
  on:input={handleInput} />

{#if minAmount && amountPaid === 0}
  <div class="minimum-amount-selection">
    <input
      type="checkbox"
      class="checkbox--square"
      id="minimum-amount-checkbox"
      on:change={handleCheckboxChange}
      checked={valueInLower === minAmount} />
    <div class="checkbox inner-checkbox" for="minimum-amount-checkbox" />
    <label class="partial-label" for="minimum-amount-checkbox">
      <!-- TODO: format amount -->
      Minimum Amount Due (₹{minAmount / 100})
    </label>
  </div>
{/if}

{#if !minAmount || amountPaid !== 0}
  <div class="subtitle subtitle--help">
    Pay some amount now and remaining later.
  </div>
{/if}
