<script>
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';
  import RewardCard from './RewardCard.svelte';
  import { isMobile } from 'common/useragent';
  import Carousel from 'ui/components/carousel/index.svelte';
  // import Paginator from 'ui/components/carousel/Paginator.svelte';

  //store
  import { rewards } from 'checkoutstore/rewards';

  // i18n
  import { t } from 'svelte-i18n';
  import {
    REWARDS_HEADER,
    REWARDS_SUB_TEXT,
    REWARDS_CLOSE,
  } from 'ui/labels/rewards';

  //props
  export let visibleindex = 0;
  export let onClick;
</script>

<style>
  .rewards-wrapper {
    white-space: normal;
  }
  .rewards-header {
    line-height: 1.4;
    font-size: 17px;
    margin-bottom: 24px;
  }
  .rewards-subtext {
    font-size: 14px;
    color: rgba(81, 89, 120, 0.7);
    margin-top: 10px;
    margin-bottom: 24px;
  }
  .rewards-list {
    display: flex;
    justify-content: space-between;
    position: relative;
  }
  :global(.mobile) .rewards-list {
    display: block;
  }
  .rewards-divider {
    border: 1px solid rgba(0, 0, 0, 0.04);
    width: 100%;
  }
  .rewards-close {
    color: #3f71d7;
    margin-top: 20px;
    cursor: pointer;
  }
  .rewards-triangle {
    border: 0px solid #fff;
    border-left-width: 12px;
    border-right-width: 12px;
    border-top-width: 12px;
    border-bottom-width: 12px;
    border-top-color: transparent;
    border-left-color: transparent;
    border-right-color: transparent;
    width: 0px;
    height: 0px;
    position: absolute;
    right: 28px;
    top: -24px;
  }
  :global(.mobile) .rewards-header {
    margin-bottom: 24px;
  }
  :global(.mobile) .rewards-subtext {
    margin-top: 30px;
    margin-bottom: 30px;
  }
  :global(.mobile) .rewards-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  :global(.mobile) .rewards-triangle {
    display: none;
  }
</style>

<div class="rewards-wrapper">
  <div class="rewards-triangle" />
  <div class="rewards-header">
    <FormattedText text={$t(REWARDS_HEADER)} />
  </div>
  <div class="rewards-list">
    {#if isMobile()}
      <Carousel items={$rewards}>
        {#each $rewards as rew}
          <RewardCard {...rew} />
        {/each}
      </Carousel>
    {:else}
      {#each $rewards as rew}
        <RewardCard {...rew} />
      {/each}
    {/if}
  </div>
  <div class="rewards-subtext">{$t(REWARDS_SUB_TEXT)}</div>
  <div class="rewards-divider" />
  <div class="rewards-close" on:click={onClick}>{$t(REWARDS_CLOSE)}</div>
</div>
