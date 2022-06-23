<script lang="ts">
  import { fly } from 'svelte/transition';

  import Icon from './Icon.svelte';

  export let title = '';
  /**
   * data = [{icon: icons.<>, label: '' }]
   */
  export let data = [];
</script>

<div class="info" transition:fly={{ duration: 200, y: 20 }}>
  <div class="title">{title}</div>
  <div class="data">
    {#each data as singleData (singleData.label)}
      <div class="single-data">
        <span class="icon">
          {#if singleData.icon}
            <Icon icon={singleData.icon} />
          {/if}
        </span>
        <span>
          {singleData.label}
        </span>
      </div>
    {/each}
  </div>
</div>

<style>
  .info {
    min-height: 150px;
    padding: 26px;
    text-align: left;
  }

  .title {
    font-weight: 500;
    font-size: 12px;
    line-height: 14px;
    text-transform: uppercase;
    color: #3f71d7;
  }

  .data {
    margin: 4px 0 4px 10px;
  }

  .single-data {
    font-size: 12px;
    line-height: 16px;
    color: rgba(81, 89, 120, 0.7);
    margin: 12px 0;
    display: flex;
  }

  .single-data:last-child {
    margin-bottom: 0;
  }

  .single-data span.icon {
    margin-right: 10px;
    min-width: 12px;
    align-self: center;
  }
</style>
