<script lang="ts">
  // svelte
  import { createEventDispatcher } from 'svelte';

  // ui elements
  import Stack from 'ui/layouts/Stack.svelte';
  import NativeRadio from 'ui/elements/NativeRadio';

  // i18n
  import { t } from 'svelte-i18n';
  import { MORE, PAY_IN, CHANGE, PAY_CONVERSION_FEE } from 'ui/labels/dcc';

  // utils
  import {
    formatAmount,
    formatAmountWithSymbol,
    formatAmountWithSymbolRawHtml,
  } from 'common/currency';
  import { isRedesignV15 } from 'razorpay';

  // props
  /**
   * Currencies list prop
   */
  export let currencies: DCC.CurrencyListType;

  /**
   * Set selected currency
   */
  export let selectedCurrency: DCC.Currency;

  /**
   * Checkout original currency
   */
  export let originalCurrency: DCC.Currency;

  /**
   * Used to show DCC markup
   */
  export let showMarkup = false;
  ///- props

  // states
  /**
   * Used to display top two currencies with radio button
   */
  let displayCurrencies: DCC.CurrencyListType = currencies.slice(0, 2);

  /**
   * Reactive state to check if selected currency is in the display-currencies list
   */
  $: isSelectedCurrencyInDisplay = !!displayCurrencies.find(
    ({ currency }) => currency === selectedCurrency
  );

  /**
   * Reactive state to check if selected currency is in currencies list. Not to confuse with isSelectedCurrencyInDisplay, selectedCurrencyInList
   * is checks complete currencies list.
   */
  $: selectedCurrencyInList = currencies.find(
    ({ currency }) => currency === selectedCurrency
  );

  /**
   * Reactive state to check if original currency is in currencies list
   */
  $: originalCurrencyInList = currencies.find(
    ({ currency }) => currency === originalCurrency
  );

  /**
   * DCC amount and forexRate for selected currency
   */
  $: dccAmount = selectedCurrencyInList?.amount;
  $: forexRate = selectedCurrencyInList?.forex_rate;

  /**
   * Selected currency fees
   */
  $: shouldPayFee =
    originalCurrencyInList &&
    selectedCurrencyInList?.currency !== originalCurrencyInList.currency;
  $: conversionFee = selectedCurrencyInList?.conversion_percentage;

  /**
   * Event dispatcher
   */
  const eventDispatcher = createEventDispatcher();

  /**
   * Remove the space between Amount and symbol on Magic Checkout Flow
   */
  const spaceAmountWithSymbol = !isRedesignV15();
  ///- states
</script>

<Stack horizontal>
  <Stack vertical>
    {#if isSelectedCurrencyInDisplay}
      <div class="display-currencies">
        <Stack horizontal>
          {#each displayCurrencies as { currency, amount } (currency)}
            <NativeRadio
              id={`currency_${currency}`}
              name="dcc-currency"
              label={showMarkup
                ? `${currency} ${formatAmount(amount, currency)}`
                : currency}
              checked={currency === selectedCurrency}
              on:change={() =>
                eventDispatcher('change', {
                  selectedCurrency: currency,
                  amount,
                })}
            />
          {/each}
        </Stack>
      </div>
    {:else}
      <div class="other-currencies">
        {$t(PAY_IN)}
        {selectedCurrency}
        {showMarkup && dccAmount !== undefined
          ? `(${formatAmountWithSymbol(
              dccAmount,
              selectedCurrency,
              spaceAmountWithSymbol
            )})`
          : ''}
      </div>
    {/if}
    <div dir="ltr">
      {#if showMarkup}
        <!-- original currency should supported -->
        {#if originalCurrencyInList}
          {#if originalCurrencyInList?.currency !== selectedCurrencyInList?.currency}
            <label
              class="child"
              for="dcc-fee-accept"
              id="dcc-fee-accept-label"
              tabIndex="0"
            >
              <input
                type="checkbox"
                class="checkbox--square"
                id="dcc-fee-accept"
                name="dcc-fee-accept"
                value="1"
                on:focus
                on:change={() =>
                  eventDispatcher('change', {
                    selectedCurrency: originalCurrency,
                    amount: originalCurrencyInList?.amount,
                  })}
                bind:checked={shouldPayFee}
              />
              <span class="checkbox" />
              <!-- LABEL: Pay currency conversion fee -->
              {$t(PAY_CONVERSION_FEE)}
            </label>
          {:else}
            <!-- LABEL: Pay in {originalCurrency} -->
            <b dir="ltr">{$t(PAY_IN)} {originalCurrency}</b>
          {/if}
        {/if}
      {:else}
        <b dir="ltr">
          {@html formatAmountWithSymbolRawHtml(dccAmount, selectedCurrency)}
        </b>
        {#if originalCurrencyInList && originalCurrencyInList?.currency !== selectedCurrencyInList?.currency}
          <span class="small-text">
            ({formatAmountWithSymbol(
              originalCurrencyInList.amount,
              originalCurrency,
              spaceAmountWithSymbol
            )})
          </span>
        {/if}
      {/if}
    </div>
  </Stack>
  <button
    class="more-btn theme-highlight-color"
    on:click|preventDefault={() => eventDispatcher('dropdown')}
  >
    {#if isSelectedCurrencyInDisplay}
      <!-- LABEL: More -->
      {$t(MORE)}
    {:else}
      <!-- LABEL: Change -->
      {$t(CHANGE)}
    {/if}
    <span class="arrow">&#xe604;</span>
  </button>
</Stack>

{#if showMarkup && originalCurrencyInList?.currency !== selectedCurrencyInList?.currency}
  <div class="dcc-charges">
    1 {selectedCurrency} = {forexRate}
    {originalCurrency} (incl. {conversionFee}% conversion charges)
  </div>
{/if}

<style lang="scss">
  .arrow {
    display: inline-block;
    font-size: 8px;
    transform: rotate(180deg);
    border: none;
  }

  .display-currencies {
    margin-bottom: 0.75rem;
  }

  .more-btn {
    background: none;
    border: none;
    font-weight: 600;
    font-size: 0.75rem;
  }

  :global(.redesign) {
    .dcc-charges {
      font-size: 10px;
    }

    #dcc-fee-accept-label {
      font-size: 12px;
      font-weight: 500;
    }
  }
</style>
