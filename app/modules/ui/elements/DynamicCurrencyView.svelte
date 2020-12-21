<script>
  import { onDestroy } from 'svelte';

  // Store
  import {
    cardNumber,
    selectedCard,
    currencyRequestId,
    dccCurrency,
  } from 'checkoutstore/screens/card';

  import {
    selectedInstrument,
    selectedInstrumentId,
  } from 'checkoutstore/screens/home';

  import { customer } from 'checkoutstore/customer';

  import { showAmount, showCtaWithDefaultText } from 'checkoutstore/cta';

  // i18n
  import { t } from 'svelte-i18n';
  import { SEARCH_PLACEHOLDER, SEARCH_TITLE, SEARCH_ALL } from 'ui/labels/dcc';

  // Utils imports
  import { getSession } from 'sessionmanager';

  import { getAmount, getCurrency, getCardCurrencies } from 'checkoutstore';

  import { getIin, getCardDigits } from 'common/card';

  import { formatAmountWithSymbol } from 'common/currency';

  // UI imports
  import Stack from 'ui/layouts/Stack.svelte';
  import Radio from 'ui/elements/Radio.svelte';
  import SearchModal from 'ui/elements/SearchModal.svelte';
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';
  import CurrencySearchItem from 'ui/elements/search-item/Currency.svelte';

  const TOP_CURRENCIES = ['USD', 'GBP', 'EUR'];
  // Constants
  const Views = {
    SAVED_CARDS: 'saved-cards',
    ADD_CARD: 'add-card',
    HOME_SCREEN: 'home-screen',
  };

  let currentEntity = null;
  let prop = null;
  let entity = null;
  let loading = true;
  let currencies = null;
  let originalAmount = getAmount();
  let selectedCurrency = null;
  let searchModalOpen = false;
  const currencyCache = {};

  // Props
  export let classes = [];
  export let visible = false;
  export let view = null;

  // Computed
  export let allClasses;

  $: allClasses = ['dcc-view'].concat(classes).join(' ');

  $: {
    if (view === Views.ADD_CARD) {
      const iin = getIin($cardNumber);
      if (iin.length >= 6) {
        prop = { iin };
      }
    } else if (
      view === Views.SAVED_CARDS &&
      $selectedCard &&
      $selectedCard.dcc_enabled
    ) {
      const tokenId = $selectedCard.id;
      prop = { tokenId };
    } else if (view === Views.HOME_SCREEN && $selectedInstrument) {
      const card = getCardByTokenId($selectedInstrument.token_id);
      if (card && card.dcc_enabled) {
        const tokenId = card.id;
        prop = { tokenId };
      } else {
        prop = null;
      }
    } else {
      prop = null;
    }
  }

  $: {
    if (prop) {
      entity = prop.iin || prop.tokenId || null;
    } else {
      entity = null;
    }
  }

  $: {
    if (view === Views.ADD_CARD) {
      // Don't show "Loading currencies..." in add card screen,
      // because we don't know if the IIN supports DCC.
      visible = entity && !loading;
    } else {
      visible = entity;
    }
  }

  $: {
    if (entity) {
      if (!currencyCache[entity]) {
        currencies = null;
        getCardCurrencies(prop).then(currencyPayload => {
          currencyCache[entity] = currencyPayload;
        });
      }
    } else {
      currencies = null;
    }
  }

  $: {
    loading = !currencies;
  }

  $: {
    selectedCurrency = cardCurrency;
  }

  $: {
    if (currencies && selectedCurrency) {
      updateAmountInHeaderAndCTA(
        formatAmountWithSymbol(dccAmount, selectedCurrency)
      );
    } else {
      updateAmountInHeaderAndCTA();
    }
  }

  $: {
    $currencyRequestId = currencyConfig && currencyConfig.currency_request_id;
    $dccCurrency = selectedCurrency;
  }

  $: currencyConfig = entity && currencyCache[entity];
  $: currencies = currencyConfig && currencyConfig.all_currencies;
  $: cardCurrency = currencyConfig && currencyConfig.card_currency;
  $: sortedCurrencies = currencies && sortCurrencies(currencies);
  $: displayCurrencies = sortedCurrencies && sortedCurrencies.slice(0, 2);
  $: dccAmount = currencies && currencies[selectedCurrency].amount;
  $: selectedCurrencyInDisplay = _Arr.find(
    displayCurrencies,
    ({ currency }) => currency === selectedCurrency
  );

  function onSelect(currency) {
    selectedCurrency = currency;
    searchModalOpen = false;
  }

  function updateAmountInHeaderAndCTA(displayAmount) {
    if (displayAmount) {
      showAmount(displayAmount);
      getSession().setRawAmountInHeader(displayAmount);
    } else {
      showCtaWithDefaultText();
      getSession().updateAmountInHeader(originalAmount);
    }
  }

  /**
   * Sort currencies with the following priority:
   * 1.) Card Currency
   * 2.) Top currencies
   * 3.) Entity Currency
   * 4.) Rest
   * @param {Object} currencies
   * @returns {Array<Object>} sortedCurrencies
   */
  function sortCurrencies(currencies) {
    const CODE = 0;
    const CONFIG = 1;

    // Insert entity currency on 2nd position.
    const topCurrencies = _Arr.insertAt(
      TOP_CURRENCIES.slice(),
      getCurrency(),
      1
    );

    const sorted = _Obj.entries(currencies).sort((_a, _b) => {
      const a = _a[CODE];
      const b = _b[CODE];
      if (a === cardCurrency) {
        return -1;
      }
      if (b === cardCurrency) {
        return 1;
      }
      if (_Arr.contains(topCurrencies, a)) {
        if (_Arr.contains(topCurrencies, b)) {
          const indexOfA = topCurrencies.indexOf(a);
          const indexOfB = topCurrencies.indexOf(b);
          return indexOfA > indexOfB ? 1 : -1;
        } else {
          return -1;
        }
      }
      return 0;
    });

    return _Arr.map(sorted, _currency => {
      const currency = _currency[0];
      const rest = _currency[1];

      return _Obj.extend(
        {
          currency,
          _key: currency,
        },
        rest
      );
    });
  }

  function showCurrenciesModal() {
    searchModalOpen = true;
  }

  function getCardByTokenId(tokenId) {
    if (!$customer.tokens) {
      return;
    }
    if (!$customer.tokens.items) {
      return;
    }
    return _Arr.find($customer.tokens.items, token => token.id === tokenId);
  }
</script>

<style>
  .arrow {
    display: inline-block;
    font-size: 8px;
    transform: rotate(180deg);
  }

  .dcc-view {
    display: none;
    border-top: 1px solid #ebedf0;
    padding: 10px 24px;
    font-size: 13px;
  }

  .dcc-view.visible {
    display: block;
  }

  .dcc-view > :global(.stack) {
    justify-content: space-between;
  }

  .dcc-view :global(.input-radio):not(:last-child) {
    margin-right: 16px;
  }

  .small-text {
    font-size: 12px;
  }

  .more-btn {
    text-transform: none;
    letter-spacing: normal;
    cursor: pointer;
  }

  .default-currencies {
    margin-bottom: 6px;
  }
</style>

<div class={allClasses} class:visible>
  {#if loading}
    Loading currencies...
  {:else}
    <Stack horizontal>
      <Stack vertical>
        {#if selectedCurrencyInDisplay}
          <div class="default-currencies">
            <Stack horizonal>
              {#each displayCurrencies as { currency, amount } (currency)}
                <Radio
                  name="dcc_currency"
                  label={currency}
                  value={amount}
                  checked={currency === selectedCurrency}
                  on:change={() => onSelect(currency)}>
                  {amount}
                </Radio>
              {/each}
            </Stack>
          </div>
        {:else}
          <div>Pay in {selectedCurrency}</div>
        {/if}
        <div dir="ltr">
          <b dir="ltr">{formatAmountWithSymbol(dccAmount, selectedCurrency)}</b>
          {#if selectedCurrency !== 'INR'}
            <span class="small-text">
              ({formatAmountWithSymbol(currencies.INR.amount, 'INR')})
            </span>
          {/if}
        </div>
      </Stack>
      <div
        class="more-btn theme-highlight-color"
        on:click={showCurrenciesModal}>
        {#if selectedCurrencyInDisplay}More{:else}Change{/if}
        <span class="arrow">&#xe604;</span>
      </div>

      <!-- LABEL: Select currency to pay -->
      <!-- LABEL: Search for currency -->
      <!-- LABEL: All currencies -->
      <SearchModal
        identifier="dcc_currency_select"
        title={$t(SEARCH_TITLE)}
        placeholder={$t(SEARCH_PLACEHOLDER)}
        all={$t(SEARCH_ALL)}
        autocomplete="transaction-currency"
        items={sortedCurrencies}
        keys={['currency', 'name', 'symbol']}
        component={CurrencySearchItem}
        on:close={() => (searchModalOpen = false)}
        on:select={({ detail }) => onSelect(detail.currency)} />
    </Stack>
  {/if}
</div>
