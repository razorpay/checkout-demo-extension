<script lang="ts">
  import { fly } from 'svelte/transition';
  import { popStack } from 'navstack';

  // icon
  import close from 'one_click_checkout/rtb_modal/icons/rtb_close';

  // component
  import Icon from './Icon.svelte';

  // props
  export let title = '';
  /**
   * data = [{icon: icons.<>, label: '' }]
   */
  export let data = [];

  const closeIcon = close('#757575');

  const closeInfoModal = () => popStack();
</script>

<div class="info" transition:fly={{ duration: 200, y: 20 }}>
  <div class="info-header">
    <h4 class="title">{title}</h4>
    <button class="info-close-btn" on:click={closeInfoModal}>
      <Icon icon={closeIcon} />
    </button>
  </div>
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
    padding: 1.5rem 1.25rem;
    text-align: left;
    bottom: -55px !important;
  }

  :global(.redesign) .info {
    bottom: 0 !important;
  }

  .title {
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 14px;
    color: #3f71d7;
    margin: 0;
  }

  .single-data {
    font-size: 0.75rem;
    line-height: 16px;
    color: rgba(81, 89, 120, 0.7);
    margin: 1rem 0;
    display: flex;
  }

  .single-data:last-child {
    margin-bottom: 0;
  }

  .single-data span.icon {
    margin-right: 14px;
    min-width: 12px;
    align-self: center;
  }

  .info-header {
    display: flex;
    align-items: center;
  }

  .info-close-btn {
    margin-left: auto;
    background: none;
    border: 0;
    color: #757575;
  }
</style>
