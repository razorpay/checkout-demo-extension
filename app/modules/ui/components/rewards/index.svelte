<script>
  // UI imports
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';
  import RewardCard from './RewardCard.svelte';

  //store
  import { rewards } from 'checkoutstore/rewards';

  $rewards = [$rewards[0]];

  // i18n
  import { t } from 'svelte-i18n';
  import {
    REWARDS_HEADER,
    REWARDS_CLOSE,
  } from 'ui/labels/rewards';

  //props
  export let onClick;
</script>

<style>
  .rewards-wrapper {
    white-space: normal;
    position: relative;
  }
  .rewards-header {
    line-height: 1.4;
    font-size: 17px;
    margin-bottom: 24px;
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
  :global(.mobile) .rewards-header {
    margin-bottom: 24px;
  }
  :global(.mobile) .rewards-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
</style>

<div class="rewards-wrapper">
  <div class="rewards-header">
    <FormattedText text={$t(REWARDS_HEADER)} />
  </div>
  {#each $rewards as rew}
    <RewardCard {...rew} />
  {/each}
  <div class="rewards-divider" />
  <div class="rewards-close" on:click={onClick}>{$t(REWARDS_CLOSE)}</div>
</div>
