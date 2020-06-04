<script>
  import { locale, locales, isLoading } from 'svelte-i18n';
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
      <option value={locale}>{locale}</option>
    {/each}
  </select>
</div>
