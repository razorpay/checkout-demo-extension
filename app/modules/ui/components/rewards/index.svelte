<script>
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';
  import RewardCard from './RewardCard.svelte';

  //store
  import { rewards } from 'checkoutstore/rewards';

  // i18n
  import { t } from 'svelte-i18n';
  import {
    REWARDS_HEADER,
    REWARDS_SUB_TEXT,
    REWARDS_UNLOCK,
    REWARDS_CLOSE,
  } from 'ui/labels/rewards';

  //props
  export let onClick;
</script>

<style>
  .rewards-wrapper {
    white-space: normal;
  }
  .rewards-header {
    line-height: 1.4;
  }
  .rewards-subtext-text {
    font-size: 11px;
    color: rgba(81, 89, 120, 0.7);
  }
  .rewards-subtext {
    margin-top: 18px;
    margin-bottom: 12px;
  }
  .rewards-list {
    display: flex;
    justify-content: space-between;
  }
  .rewards-unlock {
    margin-top: 12px;
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
  .rewards-traingle {
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
</style>

<div class="rewards-wrapper">
  <div class="rewards-traingle" />
  <div class="rewards-header">
    <FormattedText text={$t(REWARDS_HEADER)} />
  </div>
  <div class="rewards-subtext rewards-subtext-text">{$t(REWARDS_SUB_TEXT)}</div>
  <div class="rewards-list">
    {#each $rewards as rew}
      <RewardCard reward={rew} />
    {/each}
  </div>
  <div class="rewards-subtext-text rewards-unlock">{$t(REWARDS_UNLOCK)}</div>
  <div class="rewards-divider" />
  <div class="rewards-close" on:click={onClick}>{$t(REWARDS_CLOSE)}</div>
</div>
