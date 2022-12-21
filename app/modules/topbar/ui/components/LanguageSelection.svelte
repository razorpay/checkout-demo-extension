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
  import { themeStore } from 'checkoutstore/theme';
  import { isOneClickCheckout } from 'razorpay';
  import LanguageIcon from './languageIcon';
  import { shouldUseVernacular } from 'checkoutstore/methods';

  export let color: string = $themeStore.textColor;

  const isOneCC = isOneClickCheckout();

  function handleAccountModal() {
    showAccountModal({
      variant: ACCOUNT_VARIANT.LANGUAGE_ONLY,
    });
  }
  const languageIcon =
    color?.toUpperCase() !== '#FFFFFF'
      ? LanguageIcon.black
      : LanguageIcon.white;
  $: selectedLocale = $locale as string;
</script>

{#if shouldUseVernacular()}
  <div
    data-test-id="vernacular-cta"
    class="wrapper"
    class:is-one-cc={isOneCC}
    on:click|stopPropagation={handleAccountModal}
  >
    <span data-test-id="vernacular-text" class="selected-language">
      {#if isOneCC}
        {getLocaleName(selectedLocale)}
      {:else}
        <Icon icon={languageIcon} />
      {/if}
    </span>
    <span class="down-icon">
      <Icon icon={arrow_down('13', '13', color, '0 0 16 16')} />
    </span>
  </div>
{/if}

<style>
  .wrapper {
    cursor: pointer;
    display: flex;
    align-items: center;

    background: var(--light-highlight-color);
    border-radius: 2px;
    margin: 0;
    padding: 3px;
  }

  .wrapper.is-one-cc {
    background: transparent;
    padding: 0;
    margin: 0 0 auto;
  }
  .selected-language {
    margin-right: 2px;
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-semibold);
    display: inline-flex;
  }
  .is-one-cc .selected-language {
    color: var(--text-color);
  }
  .wrapper :global(svg) {
    margin-top: -1px;
    width: 15px;
    height: 15px;
  }

  .wrapper .down-icon {
    margin-top: -2px;
    height: 15px;
    :global(svg) {
      height: 10px;
      width: 10px;
    }
  }
</style>
