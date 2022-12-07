<script lang="ts">
  // Icons Specific Imports
  import Icon from 'ui/elements/Icon.svelte';
  import arrow_down from 'one_click_checkout/coupons/icons/arrow_down';

  // i18n Imports
  import { locale } from 'svelte-i18n';
  import { getLocaleName } from 'i18n/init';

  // Other Imports
  import { showAccountModal } from 'account_modal';
  import { ACCOUNT_VARIANT } from 'account_modal/constants';
  import { isMerchantCountry } from 'checkoutstore/methods';

  export let color: string;

  function handleAccountModal() {
    /**
     * Don't show language modal for MY merchants as we only support ENG for now.
     * Should be removed once regional lang supports are added.
     */
    if (isMerchantCountry('MY')) {
      return;
    }
    showAccountModal({
      variant: ACCOUNT_VARIANT.LANGUAGE_ONLY,
    });
  }
</script>

<div
  data-test-id="vernacular-cta"
  class="wrapper"
  on:click|stopPropagation={handleAccountModal}
>
  <span data-test-id="vernacular-text" class="selected-language"
    >{getLocaleName($locale)}</span
  >
  {#if !isMerchantCountry('MY')}
    <Icon icon={arrow_down('14', '14', color)} />
  {/if}
</div>

<style>
  .wrapper {
    margin: auto 0px;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .selected-language {
    margin-right: 2px;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-semibold);
  }
  :global(.one-click-checkout) .selected-language {
    color: var(--text-color);
  }
  .wrapper :global(svg) {
    margin-top: -2px;
  }
</style>
