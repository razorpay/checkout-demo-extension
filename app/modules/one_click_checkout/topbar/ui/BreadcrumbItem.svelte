<script lang="ts">
  // svelte imports
  import { t } from 'svelte-i18n';

  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';

  // util imports
  import { getIcons } from 'one_click_checkout/sessionInterface';

  export let selected = false;
  export let label = null;
  export let showIcon = false;
  export let hide = false;

  const { double_arrow } = getIcons();
</script>

{#if !hide}
  <span>
    <span
      class="breadcrumb-text"
      class:theme={selected}
      class:text-bold={selected}
    >
      {$t(label)}
    </span>
    {#if showIcon}
      <span class="breadcrumb-icon">
        <Icon icon={double_arrow} />
      </span>
    {/if}
  </span>
{/if}

<style>
  .breadcrumb-text {
    padding: 0px 2px;
  }

  .text-bold {
    font-weight: 600;
  }

  .hide {
    display: none;
  }

  .breadcrumb-icon {
    padding: 2px 8px 0px;
  }
</style>
