<script lang="ts">
  import { lastOf } from 'utils/array';
  import { elementRef, elements, isSessionControlled } from './store';

  $: lastEl = lastOf($elements);

  function giveBottomBackToFormFields() {
    const bottom = document.getElementById('bottom') as HTMLDivElement;
    document.getElementById('form-fields')?.appendChild(bottom);
  }

  function setBottomToRoot() {
    const bottom = document.getElementById('bottom') as HTMLDivElement;
    document.getElementById('root')?.appendChild(bottom);
  }

  $: {
    if ($elementRef && !$isSessionControlled) {
      setBottomToRoot();
    } else {
      giveBottomBackToFormFields();
    }
  }
</script>

<div id="root" class:active={lastEl && !$isSessionControlled}>
  {#if lastEl && !$isSessionControlled}
    <svelte:component
      this={lastEl.component}
      {...lastEl.props || {}}
      bind:this={$elementRef}
    />
  {/if}
</div>

<style>
  #root {
    position: relative;

    overflow: auto;
    display: flex;
    flex-direction: column;
  }

  #root.active {
    height: 100%;
  }

  #root > :global(*:first-child) {
    overflow-y: auto;
    height: 100%;
  }
</style>
