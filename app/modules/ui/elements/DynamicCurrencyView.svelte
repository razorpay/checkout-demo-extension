<script>
  import { tick, onDestroy } from 'svelte';

  // Store
  import {
    cardNumber,
    selectedCard,
    currencyRequestId,
    dccCurrency,
    defaultDCCCurrency,
    AVSScreenMap,
    AVSDccPayload,
  } from 'checkoutstore/screens/card';

  import { amountAfterOffer, appliedOffer } from 'checkoutstore/offers';

  import { selectedInstrument } from 'checkoutstore/screens/home';

  import { customer } from 'checkoutstore/customer';

  import {
    showProceed,
    isCtaShown,
    showAmount,
    showCtaWithDefaultText,
    setAppropriateCtaText,
  } from 'checkoutstore/cta';

  // i18n
  import { t } from 'svelte-i18n';
  import {
    CHANGE,
    LOADING_CURRENCIES,
    MORE,
    SEARCH_TITLE,
    SEARCH_PLACEHOLDER,
    SEARCH_ALL,
    PAY_CONVERSION_FEE,
    PAY_IN,
  } from 'ui/labels/dcc';

  // Utils imports
  import { getSession } from 'sessionmanager';

  import {
    getAmount,
    getCurrency,
    getCurrencies,
    isPartialPayment,
  } from 'checkoutstore';

  import { getIin } from 'common/card';

  import { formatAmount, formatAmountWithSymbol } from 'common/currency';

  // UI imports
  import Stack from 'ui/layouts/Stack.svelte';
  import Radio from 'ui/elements/Radio.svelte';
  import SearchModal from 'ui/elements/SearchModal.svelte';
  import CurrencySearchItem from 'ui/elements/search-item/Currency.svelte';

  const TOP_CURRENCIES = ['USD', 'GBP', 'EUR'];
  // Constants
  const Views = {
    SAVED_CARDS: 'saved-cards',
    ADD_CARD: 'add-card',
    HOME_SCREEN: 'home-screen',
    PAYPAL_WALLET: 'paypal',
    AVS: 'avs-card',
  };

  let prop = null;
  let entity = null;
  let loading = true;
  let currencies = null;
  let originalAmount = getAmount();
  let selectedCurrency = null;
  let originalCurrency = getCurrency();
  let payFee;
  let searchModalOpen = false;
  let entityWithAmount = null;
  let cardCurrency;
  const session = getSession();

  let currencyConfig;
  let displayCurrencies = [];
  let prevCurrency;
  const currencyCache = {};
  let forexRate;
  let fee;
  let AVSRequired = false;

  // Props
  export let classes = [];
  export let visible = false;
  export let view = null;
  export let tabVisible = null;
  export let isAVS = false;

  // Computed
  export let allClasses;

  let explicitUI = false;

  /**
   * set Currency Data used by offer & trigger apply discount
   * @param {Object} payload dcc related payload (selected currency & flow api response)
   * @param {boolean} reset if true, replace existing value with new else override
   */
  function setDCCPayload(payload, reset) {
    if (reset) {
      session.dccPayload = payload;
    } else {
      session.dccPayload = Object.assign(session.dccPayload || {}, payload);
    }
    var offer = session.getAppliedOffer();
    // if offer applied
    if (offer) {
      session.handleDiscount();
    }
  }

  $: allClasses = ['dcc-view'].concat(classes).join(' ');

  let billing_address_available = false;

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
      billing_address_available = $selectedCard.billing_address || false;
    } else if (view === Views.HOME_SCREEN && $selectedInstrument) {
      const card = getCardByTokenId($selectedInstrument.token_id);
      if (card && card.dcc_enabled) {
        const tokenId = card.id;
        prop = { tokenId };
      } else {
        prop = null;
      }
    } else if (view === Views.PAYPAL_WALLET) {
      prop = { walletCode: 'paypal' };
    } else {
      prop = null;
    }
  }

  $: {
    if (prop) {
      entity = prop.iin || prop.tokenId || prop.walletCode || null;
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
    if (isAVS) {
      visible = false;
    }
  }

  /**
   * It will only trigger in case of wallet as parent gets destroyed on back
   */
  onDestroy(() => {
    updateAmountInHeaderAndCTA();
    setDCCPayload({ view });
  });

  $: {
    if (entity) {
      if (!currencyCache[entityWithAmount]) {
        currencies = null;
        getCurrencies(prop).then((currencyPayload) => {
          currencyCache[entityWithAmount] = currencyPayload;
          // update selected currency payload [only used by offers in session.js]
          setDCCPayload({ currencyPayload, entityWithAmount });
        });
      } else if (tabVisible) {
        // update selected currency payload [only used by offers in session.js]
        setDCCPayload({
          currencyPayload: currencyCache[entityWithAmount],
          entityWithAmount,
        });
      }
    } else {
      currencies = null;
    }
  }

  $: {
    loading = !currencies;
  }

  $: selectedCurrency = cardCurrency;

  $: {
    /**
     * This is require to preselect last selected currency in case of wallet
     * as this component get destroyed with state
     */
    if (
      session?.dccPayload?.view === Views.PAYPAL_WALLET &&
      session?.dccPayload?.currency
    ) {
      selectedCurrency = session.dccPayload.currency;
    }
  }

  $: {
    payFee = selectedCurrency !== originalCurrency;
  }

  $: {
    const offer = $appliedOffer;
    if (tabVisible && (!offer || selectedCurrency !== prevCurrency)) {
      if (currencies && selectedCurrency) {
        prevCurrency = selectedCurrency;
        let amount = dccAmount;
        /**
         * if offer is applied update original amount in requested currency
         */
        if (offer) {
          const currencyData = currencyCache[entityWithOriginalAmount];
          if (currencyData && currencyData.all_currencies) {
            amount = currencyData.all_currencies[selectedCurrency].amount;
          }
        }
        updateAmountInHeaderAndCTA(
          formatAmountWithSymbol(amount, selectedCurrency),
          formatAmountWithSymbol(dccAmount, selectedCurrency)
        );
      } else if (!offer) {
        updateAmountInHeaderAndCTA();
      }
    }
  }

  function updateCurrencyCache(key, value) {
    currencyCache[key] = value;
  }

  $: {
    /**
     * this case happen if we apply offer before selecting card (saved card)
     * we don't have data of original currency amount we need that to show in header
     */
    if (
      visible &&
      entityWithOriginalAmount !== entityWithAmount &&
      !currencyCache[entityWithOriginalAmount]
    ) {
      getCurrencies({ ...prop, amount: originalAmount }).then(
        (currencyPayload) => {
          updateCurrencyCache(entityWithOriginalAmount, currencyPayload);
          prevCurrency = '';
        }
      );
    }
  }

  $: {
    $currencyRequestId = currencyConfig && currencyConfig.currency_request_id;
    $dccCurrency = selectedCurrency;
  }

  function onSelect(currency) {
    selectedCurrency = currency;
    searchModalOpen = false;
    setDCCPayload({ currency });
  }

  $: {
    if (tabVisible) {
      onSelect($dccCurrency);
    }
  }

  $: {
    if (!visible || !tabVisible) {
      // reset dcc data in session if tab is close
      setDCCPayload({}, true);
      // reset currency to INR as dcc amount to be shown only where dcc is not selected
      // this case happen when from card screen to go another screen
      prevCurrency = 'INR';
      if (tabVisible) {
        updateAmountInHeaderAndCTA();
      }
    } else {
      setDCCPayload({ enable: Boolean(visible) });
    }
  }

  $: currencyConfig = entity && currencyCache[entityWithAmount];
  $: AVSRequired = currencyConfig?.avs_required;
  $: explicitUI = currencyConfig?.show_markup;
  $: currencies = currencyConfig && currencyConfig.all_currencies;
  $: cardCurrency =
    currencyConfig &&
    (currencyConfig.card_currency || currencyConfig.wallet_currency);
  $: sortedCurrencies = currencies && sortCurrencies(currencies);
  $: displayCurrencies = sortedCurrencies && sortedCurrencies.slice(0, 2);
  $: dccAmount = currencies?.[selectedCurrency]?.amount || '';
  $: forexRate = currencies?.[selectedCurrency]?.forex_rate || '';

  $: {
    if (entity) {
      AVSScreenMap.update((value) => ({ ...value, [entity]: AVSRequired }));
    }
  }

  $: {
    $defaultDCCCurrency =
      currencyConfig &&
      (currencyConfig.card_currency || currencyConfig.wallet_currency);
  }

  $: {
    if (forexRate) {
      forexRate = parseFloat(1 / forexRate).toFixed(2);
    }
  }
  $: fee =
    (currencies && currencies[selectedCurrency].conversion_percentage) || 0;
  $: selectedCurrencyInDisplay = _Arr.find(
    displayCurrencies,
    ({ currency }) => currency === selectedCurrency
  );
  $: entityWithAmount = `${entity}-${$amountAfterOffer}`;
  $: entityWithOriginalAmount = `${entity}-${originalAmount}`;

  function updateAmountInHeaderAndCTA(displayAmount, ctaAmount) {
    tick().then(() => {
      if (displayAmount) {
        session.setRawAmountInHeader(displayAmount);
        showAmount(ctaAmount);
      } else if (!isPartialPayment()) {
        if (isCtaShown()) {
          showCtaWithDefaultText();
        } else {
          setAppropriateCtaText();
        }
        session.updateAmountInHeader(originalAmount);
      }
      if (AVSRequired) {
        showProceed();
        AVSDccPayload.set({
          header: displayAmount,
          cta: ctaAmount,
        });
      }
    });
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

    // Insert entity currency on 2nd position.
    const topCurrencies = [cardCurrency, originalCurrency];
    let i = 0;
    while (topCurrencies[0] === topCurrencies[1]) {
      topCurrencies[1] = TOP_CURRENCIES[i];
      i++;
    }

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

    return _Arr.map(sorted, (_currency) => {
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
    return _Arr.find($customer.tokens.items, (token) => token.id === tokenId);
  }
</script>

<div class={allClasses} class:visible>
  {#if loading}
    {$t(LOADING_CURRENCIES)}
  {:else}
    <Stack horizontal>
      <Stack vertical>
        {#if selectedCurrencyInDisplay}
          <div class="default-currencies">
            <Stack horizonal>
              {#each displayCurrencies as { currency, amount } (currency)}
                <Radio
                  name="dcc_currency"
                  label={explicitUI
                    ? `${currency} ${formatAmount(amount, currency)}`
                    : currency}
                  value={amount}
                  checked={currency === selectedCurrency}
                  on:change={() => onSelect(currency)}
                >
                  {explicitUI ? `${$t(PAY_IN)} ${currency}` : amount}
                </Radio>
              {/each}
            </Stack>
          </div>
        {:else}
          <div class="dcc-other-currency">
            {$t(PAY_IN)}
            {selectedCurrency}
            {explicitUI
              ? `(${formatAmountWithSymbol(dccAmount, selectedCurrency)})`
              : ''}
          </div>
        {/if}
        <div dir="ltr">
          <!-- explicitUI(new UI) -->
          {#if explicitUI}
            <!-- original currency should supported -->
            {#if currencies[originalCurrency]}
              {#if selectedCurrency !== originalCurrency}
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
                    on:change={() => onSelect(originalCurrency)}
                    bind:checked={payFee}
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
            <b dir="ltr"
              >{formatAmountWithSymbol(dccAmount, selectedCurrency)}</b
            >
            {#if selectedCurrency !== originalCurrency && currencies[originalCurrency]}
              <span class="small-text">
                ({formatAmountWithSymbol(
                  currencies[originalCurrency].amount,
                  originalCurrency
                )})
              </span>
            {/if}
          {/if}
        </div>
      </Stack>
      <div
        class="more-btn theme-highlight-color"
        on:click={showCurrenciesModal}
      >
        {#if selectedCurrencyInDisplay}
          <!-- LABEL: More -->
          {$t(MORE)}
        {:else}
          <!-- LABEL: Change -->
          {$t(CHANGE)}
        {/if}
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
        bind:open={searchModalOpen}
        on:close={() => (searchModalOpen = false)}
        on:select={({ detail }) => onSelect(detail.currency)}
      />
    </Stack>
    {#if explicitUI && selectedCurrency !== originalCurrency}
      <div class="dcc-charges">
        {`1 ${selectedCurrency} = ${forexRate} ${originalCurrency} (incl. ${fee}% conversion charges)`}
      </div>
    {/if}
  {/if}
</div>

<style>
  .arrow {
    display: inline-block;
    font-size: 8px;
    transform: rotate(180deg);
    border: none;
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

  .dcc-other-currency {
    margin-bottom: 6px;
  }

  .dcc-charges {
    font-size: 12px;
    margin-top: 6px;
  }
</style>
