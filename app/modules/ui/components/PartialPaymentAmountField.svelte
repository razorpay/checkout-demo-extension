<script lang="ts">
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import Field from 'ui/components/Field.svelte';
  import Checkbox from 'ui/elements/Checkbox.svelte';

  // i18n
  import { PARTIAL_AMOUNT_PLACEHOLDER } from 'ui/labels/home';

  import { t, locale } from 'svelte-i18n';

  import { formatTemplateWithLocale } from 'i18n';

  // Utils
  import { getSession } from 'sessionmanager';
  import { getCurrencyConfig } from 'common/currency';
  import { formatAmountWithCurrency } from 'helper/currency';
  import { getOption, isRedesignV15 } from 'razorpay';
  import { getErrorTextData } from 'partialpayments/helper';

  // Props
  export let maxAmount = null;
  export let minAmount = null;
  export let value;
  export let minAmountLabel;
  export let partialDescription;
  export let showPartialAmountLabel = false;

  const session = getSession();
  const dispatch = createEventDispatcher();
  const isRedesignV15Enabled = isRedesignV15();
  let showValidations = false;

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

  const currencyConfig = getCurrencyConfig(getOption('currency'));

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
        session.setAmount(
          Math.round(value * Math.pow(10, currencyConfig.decimals))
        );
      }
    } else {
      session.setAmount(maxAmount);
    }
  }

  const max = getAmountInMajor(maxAmount);
  const min = getAmountInMajor(minAmount);

  let errorTextLabel;
  let errorTextAmount;

  $: {
    const errorTextData = getErrorTextData(valueInMinor, maxAmount, minAmount);
    errorTextLabel = errorTextData?.errorTextLabel;
    errorTextAmount = errorTextData?.errorTextAmount;
    showValidations = errorTextData?.showValidations;
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
  placeholder={formatTemplateWithLocale(
    errorTextLabel,
    { amount: errorTextAmount },
    $locale
  )}
  label={isRedesignV15Enabled && $t(PARTIAL_AMOUNT_PLACEHOLDER)}
  helpText={formatTemplateWithLocale(
    errorTextLabel,
    { amount: errorTextAmount },
    $locale
  )}
  formatter={{ type: 'amount' }}
  bind:this={field}
  handleFocus={!isRedesignV15Enabled}
  handleBlur={true}
  handleInput={true}
  on:input={handleInput}
  showValidations={isRedesignV15Enabled && showValidations}
  validationText={formatTemplateWithLocale(
    errorTextLabel,
    { amount: errorTextAmount },
    $locale
  )}
/>

{#if showPartialAmountLabel}
  <div class="minimum-amount-selection">
    <Checkbox
      id="min-amount-checkbox"
      on:change={handleCheckboxChange}
      checked={valueInMinor === minAmount}
    >
      {minAmountLabel}
      {formatAmountWithCurrency(minAmount)}
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
