<script>
  // UI imports
  import Tab from 'ui/tabs/Tab.svelte';
  import NextOption from 'ui/elements/options/NextOption.svelte';

  // Utils imports
  import { getPayLaterProviders } from 'checkoutstore/methods';
  import { createProvider } from 'common/paylater';

  // Store imports
  import { methodInstrument } from 'checkoutstore/screens/home';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { getPaylaterProviderName } from 'i18n';
  import { SELECT_OPTION_TITLE } from 'ui/labels/paylater';

  const providers = _Arr.map(getPayLaterProviders(), (providerObj) =>
    createProvider(providerObj.code, providerObj.name)
  );

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
    if (!instrument || instrument.method !== 'paylater') {
      return providers;
    }

    if (!instrument.providers) {
      return providers;
    }

    let filteredProviders = _Arr.filter(providers, (provider) =>
      _Arr.contains(instrument.providers, provider.data.code)
    );

    return filteredProviders;
  }

  let filteredProviders = providers;
  $: filteredProviders = filterProvidersAgainstInstrument(
    providers,
    $methodInstrument
  );
</script>

<Tab method="paylater">
  <input type="hidden" name="provider" />
  <input type="hidden" name="ott" />
  <!-- LABEL: Select an Option -->
  <h3>{$t(SELECT_OPTION_TITLE)}</h3>
  <div class="options">
    {#each filteredProviders as provider (provider.title)}
      <NextOption
        attributes={{ 'data-paylater': provider.data.code }}
        tabindex={0}
        {...provider}
        on:select
      >
        {getPaylaterProviderName(provider.data.code, $locale)}
      </NextOption>
    {/each}
  </div>
</Tab>
