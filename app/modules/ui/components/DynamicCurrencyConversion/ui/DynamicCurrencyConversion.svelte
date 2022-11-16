<script lang="ts">
  // svelte
  import { onMount, createEventDispatcher } from 'svelte';

  // i18n
  import { t } from 'svelte-i18n';
  import {
    LOADING_CURRENCIES,
    SEARCH_ALL,
    SEARCH_PLACEHOLDER,
  } from 'ui/labels/dcc';

  // api
  import { fetchCurrencies } from '../api';

  // ui elements
  import CurrencySelect from './CurrencySelect.svelte';
  import CurrencySelectDialog from './CurrencySelectDialog.svelte';
  import triggerSearchModal from 'components/SearchModal';

  // analytics
  import * as trackers from '../events';

  // constants
  import { EmitEvents } from '../constants';

  // store actions
  import {
    resetDCCPayload,
    setDCCPayload,
    setPaymentMethodOnDCCPayload,
  } from '../store';

  // props
  /**
   * Customize styles for component by adding class on root element
   * default to blank string
   *
   * @example
   * <DynamicCurrencyConversion className="custom-class" />
   */
  export const className: DCC.Props['className'] = '';

  /**
   * To improve DCC analytics tracking, add the payment method
   * default to blank string
   * @example
   * <DynamicCurrencyConversion method="card" />
   * <DynamicCurrencyConversion method="paypal" />
   * <DynamicCurrencyConversion method="trustly" />
   * <DynamicCurrencyConversion method="poli" />
   */
  export const method: DCC.Props['method'] = '';

  /**
   * Prop to show selected currency on the UI and also to make controlled component
   * default to blank string
   *
   * @example
   * <DynamicCurrencyConversion selectedCurrency="USD" />
   *
   * @example
   * let selectedCurrency = 'INR';
   *
   * <DynamicCurrencyConversion
   *  {selectedCurrency}
   *  on:selectedCurrencyChange={(evt) => selectedCurrency = evt.detail}
   * />
   */
  export let selectedCurrency: DCC.Props['selectedCurrency'] = '';

  /**
   * Indicate wether dcc is enabled or not for a payment method. If false component will not render.
   *
   * @example
   * <DynamicCurrencyConversion dccEnabled />
   * <DynamicCurrencyConversion dccEnabled={method !== 'UPI'} />
   */
  export let dccEnabled: DCC.Props['dccEnabled'] = true;

  /**
   * Pass original checkout amount to dcc component.
   *
   * @example
   * <DynamicCurrencyConversion amount={100} />
   */
  export let amount: DCC.Props['amount'];

  /**
   * Along with amount pass original checkout currency to dcc component
   *
   * @example
   * <DynamicCurrencyConversion originalCurrency="INR" />
   */
  export let originalCurrency: DCC.Props['originalCurrency'];

  /**
   * A payment instrument. Derived from payment method. e.g card number(424242), card tokenId(token_ral23), wallet code(paypal) and provider(trustly, poli)
   *
   * @example
   * // Card number
   * <DynamicCurrencyConversion instrument="4242424242424242" identifier="iin" />
   *
   * @example
   * // Card token
   * <DynamicCurrencyConversion instrument="token_jafl3hf3" identifier="tokenId" />
   *
   * @example
   * // Wallet
   * <DynamicCurrencyConversion instrument="paypal" identifier="walletCode" />
   *
   * @example
   * // Instant Bank Transfer
   * <DynamicCurrencyConversion instrument="trustly" identifier="provider" />
   * <DynamicCurrencyConversion instrument="poli" identifier="provider" />
   */
  export let entity: DCC.Props['entity'];

  /**
   * Identifier for payment method instrument, e.g ‘iin’ | ‘tokenId’ | ‘walletCode’ | ‘provider’, which can be sent to /flows api
   *
   * @example
   * // Card number
   * <DynamicCurrencyConversion instrument="4242424242424242" identifier="iin" />
   *
   * @example
   * // Card token
   * <DynamicCurrencyConversion instrument="token_jafl3hf3" identifier="tokenId" />
   *
   * @example
   * // Wallet
   * <DynamicCurrencyConversion instrument="paypal" identifier="walletCode" />
   *
   * @example
   * // Instant Bank Transfer
   * <DynamicCurrencyConversion instrument="trustly" identifier="provider" />
   * <DynamicCurrencyConversion instrument="poli" identifier="provider" />
   */
  export let identifier: DCC.Props['identifier'];
  ///- props

  // states
  /**
   * Indicates if fetch currencies api is loading. Mark false on success or fail
   */
  let isLoading = false;

  /**
   * Indicates if component is in errored states. If fetch currencies api throws error.
   */
  let isError = false;

  /**
   * Used to store list of DCC currencies from /flows api response
   */
  let currenciesList: DCC.CurrencyListType = [];

  /**
   * Dispatch events
   */
  let eventDispatcher = createEventDispatcher();

  /**
   * Used to show DCC markup
   */
  let showMarkup = false;
  ///- states

  // methods
  const dispatchEvents = (type: EmitEvents, data?: DCC.EmitEventDataType) => {
    switch (type) {
      case EmitEvents.currencyMetaLoading: {
        eventDispatcher('currencyMetaLoading', { isLoading });
        break;
      }
      case EmitEvents.currencyMetaFailed: {
        eventDispatcher('currencyMetaFailed', { isError });
        break;
      }
      case EmitEvents.currencyMetaLoaded: {
        eventDispatcher('currencyMetaLoaded', data);
        break;
      }
      case EmitEvents.selectedCurrencyChange: {
        eventDispatcher('selectedCurrencyChange', data);
        if (typeof data === 'string') {
          trackers.trackSelectedCurrencyChange({
            previousSelectedCurrency: selectedCurrency,
            selectedCurrency: data,
          });
        }
        break;
      }
      default: {
      }
    }
  };

  const openCurrencySelectDialog = () => {
    triggerSearchModal({
      identifier: 'dcc_currency_select',
      placeholder: SEARCH_PLACEHOLDER,
      all: SEARCH_ALL,
      autocomplete: 'transaction-currency',
      items: currenciesList,
      keys: ['currency', 'name', 'symbol'],
      component: CurrencySelectDialog,
      onSelect: (data: DCC.CurrencyListType[0]) => {
        trackers.trackCurrencySelectedFromDialog();
        dispatchEvents(EmitEvents.selectedCurrencyChange, {
          selectedCurrency: data.currency,
          amount: data.amount,
        });
      },
    });

    trackers.trackSelectCurrencyDialogOpen();
  };
  ///- methods

  // lifecyle
  onMount(async () => {
    trackers.addMetaProperties(method, {
      entity,
      method,
      selectedCurrency,
      dccEnabled,
      amount,
      originalCurrency,
      identifier,
    });
    trackers.trackRender();

    // Reset DCCPayload store on mount
    resetDCCPayload();

    if (entity) {
      isLoading = true;
      dispatchEvents(EmitEvents.currencyMetaLoading);
      trackers.trackFetchCurrenciesLoading();

      const response = await fetchCurrencies({
        amount,
        entity,
        identifier,
        currency: originalCurrency,
      });

      isLoading = false;
      isError = !!response.error;

      if (isError) {
        dispatchEvents(EmitEvents.currencyMetaFailed);
        trackers.trackFetchCurrenciesFailed({
          error: response.error,
          selectedCurrency,
        });
      }

      if (response.data) {
        currenciesList = response.data.currencies;
        showMarkup = !!response.data.show_markup;

        setDCCPayload({
          ...response.data,
          enable: !!dccEnabled,
          defaultCurrency: response.data.selectedCurrency,
        });
        dispatchEvents(EmitEvents.currencyMetaLoaded, response.data);
        if (!selectedCurrency && response.data.selectedCurrency) {
          dispatchEvents(EmitEvents.selectedCurrencyChange, {
            selectedCurrency: response.data.selectedCurrency,
            amount: response.data.amount,
          });
        }
        trackers.trackFetchCurrenciesSuccess({
          currenciesCount: response.data.currencies.length,
          avsRequiredFlagEnabled: !!response.data.avs_required,
          appCurrency: response.data.app_currency,
          walletCurrency: response.data.wallet_currency,
          cardCurrency: response.data.card_currency,
          currencyRequestIdLoaded: !!response.data.currency_request_id,
          selectedCurrency,
        });
      }
    }

    setPaymentMethodOnDCCPayload(method);

    return () => {
      // cleanup
      trackers.removeMetaProperties(method);
    };
  });
  ///- lifecycle
</script>

{#if dccEnabled}
  <div class={`dcc-view${className ? ` ${className}` : ''}`}>
    {#if isLoading}
      <!-- Label: Loading currencies... -->
      {$t(LOADING_CURRENCIES)}
    {:else if selectedCurrency}
      <CurrencySelect
        {showMarkup}
        {selectedCurrency}
        {originalCurrency}
        currencies={currenciesList}
        on:dropdown={openCurrencySelectDialog}
        on:change={(evt) =>
          dispatchEvents(EmitEvents.selectedCurrencyChange, evt.detail)}
      />
    {/if}
  </div>
{/if}

<style lang="scss">
  .dcc-view {
    border-top: 1px solid #ebedf0;
    padding: 0.625rem 1.5rem;
    font-size: 0.75rem;
  }

  .dcc-view > :global(.stack) {
    justify-content: space-between;
    align-items: flex-start;
  }

  :global(.redesign) {
    .dcc-view {
      padding: 0.625rem 1rem;
    }
  }
</style>
