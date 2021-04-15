<script>
  // UI imports
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';
  import RewardCard from 'ui/components/rewards/RewardCard.svelte';

  //store
  import { rewards } from 'checkoutstore/rewards';

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
    background: url('/images/checkout/rewards_bg.svg');
    background-position-y: -60px;
    background-repeat: no-repeat;
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
    text-align: left;
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
