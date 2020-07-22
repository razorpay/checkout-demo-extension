<script>
  // UI imports
  import NextOption from 'ui/elements/options/NextOption.svelte';

  // Utils imports
  import { createProvider } from 'common/cardlessemi';
  import {
    getCardlessEMIProviders,
    isMethodUsable,
    isDebitEMIEnabled,
  } from 'checkoutstore/methods';

  // Store imports
  import { methodInstrument } from 'checkoutstore/screens/home';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { getCardlessEmiProviderName } from 'i18n';
  import { SELECT_OPTION_TITLE } from 'ui/labels/cardlessemi';

  const providers = getAllProviders();

  /**
   * Returns _all_ Cardless EMI providers
   *
   * @returns {Array<Provider>}
   */
  function getAllProviders() {
    let providers = [];

    _Obj.loop(getCardlessEMIProviders(), providerObj => {
      providers.push(createProvider(providerObj.code));
    });

    if (isMethodUsable('emi')) {
      providers.unshift(createProvider('cards'));
    }

    return providers;
  }

  /**
   * Filters providers against the given instrument.
   * Only allows those providers that match the given instruments.
   *
   * @param {Array<string>} providers
   * @param {Instrument} instrument
   *
   * @returns {Object}
   */
  function filterProvidersAgainstInstrument(providers, instrument) {
    if (!instrument || instrument.method !== 'cardless_emi') {
      return providers;
    }

    if (!instrument.providers) {
      return providers;
    }

    const filteredProviders = _Arr.filter(providers, provider =>
      _Arr.contains(instrument.providers, provider.data.code)
    );

    return filteredProviders;
  }

  let filteredProviders = providers;
  $: filteredProviders = filterProvidersAgainstInstrument(
    providers,
    $methodInstrument
  );

  function getOverriddenProviderCode(code) {
    if (code === 'cards' && isDebitEMIEnabled()) {
      code = 'credit_debit_cards';
    }
    return code;
  }
</script>

<div class="tab-content showable screen pad collapsible" id="form-cardless_emi">
  <input type="hidden" name="emi_duration" />
  <input type="hidden" name="provider" />
  <input type="hidden" name="ott" />
  <!-- TITLE: Select an option -->
  <h3>{$t(SELECT_OPTION_TITLE)}</h3>
  <div class="options">
    {#each filteredProviders as provider (provider.data.code)}
      <NextOption {...provider} on:select>
        {getCardlessEmiProviderName(getOverriddenProviderCode(provider.data.code), $locale)}
      </NextOption>
    {/each}
  </div>
</div>
