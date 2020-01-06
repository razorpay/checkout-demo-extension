<script>
  import Field from 'templates/views/ui/Field.svelte';

  import { getSession } from 'sessionmanager';
  import { getCurrencyConfig } from 'common/currency';

  export let maxAmount = null;
  export let minAmount = null;
  export let amountPaid = null;
  export let value;
  export let minAmountLabel;
  export let partialDescription;
  export let showMinAmountCheckbox = false;

  const session = getSession();

  // Refs
  let field;

  // Computed
  let valueInMinor;

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

  const currencyConfig = getCurrencyConfig(session.get('currency'));

  // If min amount is absent, set it from currency
  if (!minAmount) {
    minAmount = currencyConfig.minimum;
  }

  function getAmountInMinor(amount) {
    return parseInt(amount * Math.pow(10, currencyConfig.decimals));
  }

  function getAmountInMajor(amount) {
    return parseFloat(
      (parseInt(amount) / Math.pow(10, currencyConfig.decimals)).toFixed(
        currencyConfig.decimals
      )
    );
  }

  $: valueInMinor = getAmountInMinor(value);

  $: {
    if (value) {
      if (valueInMinor >= minAmount && valueInMinor <= maxAmount) {
        session.setAmount(value * 100);
      }
    } else {
      session.setAmount(maxAmount);
    }
  }

  const max = getAmountInMajor(maxAmount);
  const min = getAmountInMajor(minAmount);

  let helpText;

  $: {
    if (!value) {
      helpText = `Please enter a valid amount upto ${session.formatAmountWithCurrency(
        maxAmount
      )}`;
    } else if (valueInMinor < minAmount) {
      helpText = `Minimum payable amount is ${session.formatAmountWithCurrency(
        minAmount
      )}`;
    } else if (valueInMinor > maxAmount) {
      helpText = `Amount cannot exceed ${session.formatAmountWithCurrency(
        maxAmount
      )}`;
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

  .subtitle.subtitle--help {
    margin-left: 0 !important;
  }
</style>

<!-- TODO: format amount in helpText -->
<Field
  elemClasses="mature"
  id="amount-value"
  name="amount"
  type="tel"
  {value}
  required
  {max}
  {min}
  placeholder="Enter amount"
  {helpText}
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
      checked={valueInMinor === minAmount} />
    <div class="checkbox inner-checkbox" for="minimum-amount-checkbox" />
    <label class="partial-label" for="minimum-amount-checkbox">
      {minAmountLabel} {session.formatAmountWithCurrency(minAmount)}
    </label>
  </div>
{/if}

{#if showMinAmountCheckbox}
  <div class="subtitle subtitle--help">{partialDescription}</div>
{/if}
