<script>
  // Icons Specific Imports
  import Icon from 'ui/elements/Icon.svelte';
  import arrow_down from 'one_click_checkout/coupons/icons/arrow_down';

  // i18n Imports
  import { locale } from 'svelte-i18n';
  import { getLocaleName } from 'i18n/init';

  // Other Imports
  import { showAccountModal } from 'one_click_checkout/account_modal';
  import { ACCOUNT_VARIANT } from 'one_click_checkout/account_modal/constants';

  function handleAccountModal() {
    showAccountModal({
      variant: ACCOUNT_VARIANT.LANGUAGE_ONLY,
    });
  }
</script>

<div class="wrapper" on:click|stopPropagation={handleAccountModal}>
  <span class="selected-langauage">{getLocaleName($locale)}</span>
  <Icon icon={arrow_down(9, 9)} />
</div>

<style>
  .wrapper {
    margin: auto 0px;
    cursor: pointer;
  }
  .selected-langauage {
    margin-right: 6px;
    font-size: 12px;
  }
</style>
