<script>
  // Svelte imports

  // UI Imports
  import SelectedOption from 'ui/elements/options/SelectedOption.svelte';

  // Store

  // Utils imports
  import { getIcon as getNetworkIcon } from 'icons/network';
  import { getCardMetadata } from 'common/card';

  // Constants
  import { TAB_TITLES as CARD_TYPE_CAPTION } from 'common/constants';

  // Props
  export let entity;

  let metadata = {};

  $: {
    if (entity) {
      metadata = getCardMetadata(entity);
    }
  }

  function getCardCaption(issuer = '', type, last4) {
    // HDFC Credit Card - 4321
    return issuer + ' ' + CARD_TYPE_CAPTION[type + '_card'] + ' - ' + last4;
  }
</script>

<style>

</style>

<div class="card-box">
  <SelectedOption
    icon={getNetworkIcon(metadata.network)}
    title={getCardCaption(metadata.issuer, metadata.type, metadata.last4)} />
</div>
