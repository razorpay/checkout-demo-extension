<script>
  // UI imports
  import NextOption from 'ui/elements/options/NextOption.svelte';

  // Utils imports
  import { createProvider } from 'common/cardlessemi';
  import {
    getCardlessEMIProviders,
    isMethodEnabled,
    isDebitEMIEnabled,
  } from 'checkoutstore/methods';

  const providers = getAllProviders();

  /**
   * Returns _all_ Cardless EMI providers
   *
   * @returns {Array<Provider>}
   */
  function getAllProviders() {
    let providers = [];

    _Obj.loop(getCardlessEMIProviders(), providerObj => {
      providers.push(createProvider(providerObj.code, providerObj.name));
    });

    if (isMethodEnabled('emi')) {
      providers.unshift(
        createProvider(
          'cards',
          isDebitEMIEnabled() ? 'EMI on Debit/Credit Cards' : 'EMI on Cards'
        )
      );
    }

    return providers;
  }
</script>

<div class="tab-content showable screen pad collapsible" id="form-cardless_emi">
  <input type="hidden" name="emi_duration" />
  <input type="hidden" name="provider" />
  <input type="hidden" name="ott" />
  <h3>Select an Option</h3>
  <div class="options">
    {#each providers as provider}
      <NextOption {...provider} on:select>{provider.title}</NextOption>
    {/each}
  </div>
</div>
