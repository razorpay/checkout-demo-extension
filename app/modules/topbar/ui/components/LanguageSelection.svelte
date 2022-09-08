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

  export let color: string;

  function handleAccountModal() {
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
  <Icon icon={arrow_down('14', '14', color)} />
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
    color: #c3daff;
  }
  .wrapper :global(svg) {
    margin-top: -2px;
  }
</style>
