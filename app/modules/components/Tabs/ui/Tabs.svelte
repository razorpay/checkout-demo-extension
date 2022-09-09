<script context="module">
  export const TABS = {};
</script>

<script lang="ts">
  import { setContext, onDestroy, createEventDispatcher } from 'svelte';
  import { selectedTab } from '../tabStore';
  import type { TabList, Tab } from 'emiV2/types';

  const tabs: TabList = [];
  const dispatch = createEventDispatcher();

  setContext(TABS, {
    registerTab: (tab: Tab) => {
      tabs.push(tab);
      selectedTab.update((current) => current || tab.value);
      onDestroy(() => {
        const i = tabs.indexOf(tab);
        selectedTab.update((current) =>
          current === tab.value
            ? tabs[i].value || tabs[tabs.length - 1].value
            : current
        );
      });
    },
    selectTab: (tab: Tab) => {
      selectedTab.set(tab.value);
      dispatch('tab-change');
    },
  });
</script>

<div class="tabs">
  <slot />
</div>
