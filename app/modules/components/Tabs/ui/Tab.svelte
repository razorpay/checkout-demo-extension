<script lang="ts">
  import { getContext } from 'svelte';
  import { TABS } from './Tabs.svelte';
  import { selectedTab } from '../tabStore';
  import type { Tab } from 'emiV2/types';

  export let tab: Tab;
  const { registerTab, selectTab } = getContext(TABS);

  registerTab(tab);
</script>

<div
  class:selected={$selectedTab === tab.value}
  class="tab-item"
  on:click={() => selectTab(tab)}
>
  <slot />
</div>

<style>
  .tab-item {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    margin: 0;
    color: #5a5a5a;
    font-size: 14px;
    cursor: pointer;
    font-weight: 400;
    padding: 12px 0px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    flex-basis: 100%;
    text-transform: capitalize;
  }

  .tab-item:not(:last-child)::after {
    content: '';
    width: 24px;
    position: absolute;
    transform: rotate(90deg);
    border: 1px solid #c4c4c4;
    left: 90%;
  }

  .selected {
    border-bottom: 3px solid var(--highlight-color);
    color: var(--highlight-color);
    font-weight: 600;
  }
</style>
