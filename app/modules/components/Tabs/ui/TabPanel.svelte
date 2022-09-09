<script lang="ts">
  import { selectedTab } from '../tabStore';
  import type { Tab } from 'emiV2/types';
  export let panel: Tab;
</script>

{#if $selectedTab === panel.value}
  <slot />
{/if}
