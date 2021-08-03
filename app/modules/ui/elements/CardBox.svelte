<script>
  // Svelte imports

  // UI Imports
  import SelectedOption from 'ui/elements/options/SelectedOption.svelte';

  // i18n
  import { locale } from 'svelte-i18n';
  import { getRawMethodTitle } from 'i18n';

  // Utils imports
  import { getIcon as getNetworkIcon } from 'icons/network';
  import { getCardMetadata } from 'common/card';

  // Props
  export let entity;

  let metadata = {};

  $: {
    if (entity) {
      metadata = getCardMetadata(entity);
    }
  }

  function getCardCaption(issuer = '', type, last4, locale) {
    // HDFC Credit Card - 4321
    const method = type ? `${type}_card` : 'card';
    return issuer + ' ' + getRawMethodTitle(method, locale) + ' - ' + last4;
  }
</script>

<div class="card-box">
  <SelectedOption
    icon={getNetworkIcon(metadata.network)}
    title={getCardCaption(
      metadata.issuer,
      metadata.type,
      metadata.last4,
      $locale
    )}
  />
</div>

<style>
</style>
