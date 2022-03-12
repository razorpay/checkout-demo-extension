<script>
  // UI imports
  import Tab from 'ui/tabs/Tab.svelte';
  import NextOption from 'ui/elements/options/NextOption.svelte';
  import AccountTab from 'one_click_checkout/account_modal/ui/AccountTab.svelte';

  // Utils imports
  import { getPayLaterProviders } from 'checkoutstore/methods';
  import { createProvider } from 'common/paylater';
  import { setTabTitle } from 'one_click_checkout/topbar/helper';

  // Store imports
  import { methodInstrument } from 'checkoutstore/screens/home';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { getPaylaterProviderName } from 'i18n';
  import { SELECT_OPTION_TITLE } from 'ui/labels/paylater';

  // Constant imports
  import { TAB_TITLE } from 'one_click_checkout/topbar/constants';

  const providers = _Arr.map(getPayLaterProviders(), (providerObj) =>
    createProvider(providerObj.code, providerObj.name)
  );

  export function onShown() {
    setTabTitle(TAB_TITLE.PAYLATER);
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

<Tab method="paylater" pad={false}>
  <div class="paylater-wrapper">
    <input type="hidden" name="provider" />
    <input type="hidden" name="ott" />
    <!-- LABEL: Select an Option -->
    <h3 class="paylater-header">{$t(SELECT_OPTION_TITLE)}</h3>
    <div class="options paylater-section">
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
    <AccountTab />
  </div>
</Tab>

<style>
  .paylater-section {
    margin: 0 18px 14px;
  }

  .paylater-header {
    margin: 14px 28px;
  }

  .paylater-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>
