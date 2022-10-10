<script lang="ts">
  import {
    formatTemplateWithLocale,
    getShortBankName,
    translateEmiTabName,
  } from 'i18n';
  import { locale } from 'svelte-i18n';
  import { USE_BANK_CARD } from 'ui/labels/card';

  export let selectedTab = '';
  export let selectedBank = '';
</script>

<p class="label">
  {formatTemplateWithLocale(
    USE_BANK_CARD,
    {
      bank: selectedBank,
      type: translateEmiTabName(selectedTab, $locale),
    },
    $locale
  )}
</p>

<style>
  .label {
    color: #263a4a;
    font-size: 14px;
    font-weight: 400;
  }
</style>
