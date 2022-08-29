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
  <span class="item">
    <span class="text" class:theme={selected} class:text-bold={selected}>
      {$t(label)}
    </span>
    {#if showIcon}
      <span class="icon">
        <Icon icon={double_arrow} />
      </span>
    {/if}
  </span>
{/if}

<style>
  .text {
    padding: 0px 2px;
  }

  .text-bold {
    font-weight: var(--font-weight-semibold);
  }

  .hide {
    display: none;
  }

  .icon {
    padding: 2px 4px 0px;
  }

  .item {
    display: flex;
    align-items: center;
  }
</style>
