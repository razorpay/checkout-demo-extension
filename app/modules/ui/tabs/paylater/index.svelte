<script lang="ts">
  import { onMount, tick } from 'svelte';
  // UI imports
  import Tab from 'ui/tabs/Tab.svelte';
  import NextOption from 'ui/elements/options/NextOption.svelte';
  import AccountTab from 'account_modal/ui/AccountTab.svelte';

  // Utils imports
  import { getPayLaterProviders } from 'checkoutstore/methods';
  import { createProvider } from 'common/paylater';
  import { isRedesignV15 } from 'razorpay';

  // Store imports
  import { methodInstrument } from 'checkoutstore/screens/home';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { getPaylaterProviderName } from 'i18n';
  import { SELECT_OPTION_TITLE } from 'ui/labels/paylater';

  const providers = getPayLaterProviders().map((providerObj) =>
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

    let filteredProviders = providers.filter((provider) =>
      instrument.providers.includes(provider.data.code)
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
  <div class="paylater-container">
    <div class="paylater-wrapper" class:screen-one-cc={isRedesignV15()}>
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
  .screen-one-cc {
    min-height: 100%;
  }
  .paylater-container {
    height: 100%;
    overflow: auto;
  }

  :global(.redesign) .paylater-header {
    margin: 16px 18px 14px;
    text-transform: capitalize;
    color: var(--primary-text-color);
    font-size: var(--font-size-body);
    font-weight: var(--font-weight-semibold);
  }

  :global(#content.one-cc) .paylater-section {
    margin: 0px 16px 14px;
  }
</style>
