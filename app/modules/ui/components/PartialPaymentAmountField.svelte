<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import Field from 'ui/components/Field.svelte';
  import Checkbox from 'ui/elements/Checkbox.svelte';

  // i18n
  import {
    PARTIAL_AMOUNT_PLACEHOLDER,
    PARTIAL_AMOUNT_HELP_INVALID,
    PARTIAL_AMOUNT_HELP_LOWER,
    PARTIAL_AMOUNT_HELP_HIGHER,
  } from 'ui/labels/home';

  import { t, locale } from 'svelte-i18n';

  import { formatTemplateWithLocale } from 'i18n';

  // Utils
  import { getSession } from 'sessionmanager';
  import { getCurrencyConfig } from 'common/currency';

  // Props
  export let maxAmount = null;
  export let minAmount = null;
  export let value;
  export let minAmountLabel;
  export let partialDescription;
  export let showPartialAmountLabel = false;

  const session = getSession();
  const dispatch = createEventDispatcher();

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
      dispatch('check');
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

  let helpTextLabel;
  let helpTextAmount;

  $: {
    if (!value) {
      helpTextLabel = PARTIAL_AMOUNT_HELP_INVALID;
      helpTextAmount = session.formatAmountWithCurrency(maxAmount);
    } else if (valueInMinor < minAmount) {
      helpTextLabel = PARTIAL_AMOUNT_HELP_LOWER;
      helpTextAmount = session.formatAmountWithCurrency(minAmount);
    } else if (valueInMinor > maxAmount) {
      helpTextLabel = PARTIAL_AMOUNT_HELP_HIGHER;
      helpTextAmount = session.formatAmountWithCurrency(maxAmount);
    }
  }
</script>

<!-- LABEL: Enter amount -->
<Field
  elemClasses="mature"
  id="amount-value"
  name="amount"
  type="tel"
  {value}
  required
  {max}
  {min}
  placeholder={$t(PARTIAL_AMOUNT_PLACEHOLDER)}
  helpText={formatTemplateWithLocale(
    helpTextLabel,
    { amount: helpTextAmount },
    $locale
  )}
  formatter={{ type: 'amount' }}
  bind:this={field}
  handleFocus={true}
  handleBlur={true}
  handleInput={true}
  on:input={handleInput}
/>

{#if showPartialAmountLabel}
  <div class="minimum-amount-selection">
    <Checkbox
      id="min-amount-checkbox"
      on:change={handleCheckboxChange}
      checked={valueInMinor === minAmount}
    >
      {minAmountLabel}
      {session.formatAmountWithCurrency(minAmount)}
    </Checkbox>
  </div>
  <div class="subtitle subtitle--help">{partialDescription}</div>
{/if}

<style>
  .minimum-amount-selection {
    margin: 12px 0 0 0;
  }

  .subtitle.subtitle--help {
    margin-left: 0 !important;
  }
</style>
