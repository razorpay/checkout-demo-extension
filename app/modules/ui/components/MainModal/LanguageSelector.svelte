<script lang="ts">
  import { locale } from 'svelte-i18n';
  import { getLocaleName } from 'i18n/init';
  import { shouldUseVernacular } from 'checkoutstore/methods';
  import LanguageSelection from 'ui/elements/LanguageSelection.svelte';
  import { pushOverlay } from 'navstack';

  let ref;

  function askLanguage() {
    pushOverlay({
      component: LanguageSelection,
      props: {
        top: ref.offsetTop,
      },
    });
  }
</script>

{#if shouldUseVernacular()}
  <div id="language-dropdown" bind:this={ref}>
    <span class="selected" on:click={askLanguage}>
      {getLocaleName($locale)}
    </span>
  </div>
{/if}

<style>
  #language-dropdown {
    background: rgba(0, 0, 0, 0.1);
    margin: 0 -24px -8px;
    line-height: 30px;
    padding: 0 24px;
    clear: both;
  }
  .selected {
    padding-bottom: 1px;
    display: inline-block;
    cursor: pointer;
  }
  .selected::after {
    content: '';
    font-size: 16px;
    position: relative;
    top: -1px;
    margin-left: 12px;
  }
</style>
