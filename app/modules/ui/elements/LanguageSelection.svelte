<script>
  import { locale, locales, isLoading } from 'svelte-i18n';
  import { getLocaleName } from 'i18n/init';
</script>

<style>
  .elem,
  .select-arrow {
    color: #fff;
  }

  option {
    color: #363636;
  }
</style>

<div class="elem select">
  <i class="select-arrow"></i>
  <select bind:value={$locale} class="input">
    {#each $locales as locale (locale)}
      <option value={locale}>{getLocaleName(locale)}</option>
    {/each}
  </select>
</div>
