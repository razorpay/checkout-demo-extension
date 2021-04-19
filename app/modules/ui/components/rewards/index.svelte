<script>
  // UI imports
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';
  import RewardCard from 'ui/components/rewards/RewardCard.svelte';
  import { formatTemplateWithLocale } from 'i18n';

  //store
  import { rewards } from 'checkoutstore/rewards';

  let { brand_name } = $rewards[0];

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { REWARDS_HEADER, REWARDS_CLOSE } from 'ui/labels/rewards';

  //props
  export let onClick;
</script>

<div class="rewards-wrapper">
  <div class="rewards-header">
    <FormattedText
      text={formatTemplateWithLocale(
        REWARDS_HEADER,
        { brandName: brand_name },
        $locale
      )}
    />
  </div>
  {#each $rewards as rew}
    <RewardCard {...rew} />
  {/each}
  <div class="rewards-divider" />
  <div class="rewards-close" on:click={onClick}>{$t(REWARDS_CLOSE)}</div>
</div>

<style>
  .rewards-wrapper {
    white-space: normal;
    position: relative;
    background: url('https://cdn.razorpay.com/checkout/rewards_bg.svg');
    background-position-y: -60px;
    background-repeat: no-repeat;
    background-position-x: -50px;
    background-size: 400px 400px;
  }
  .rewards-header {
    line-height: 1.4;
    font-size: 16px;
    margin-bottom: 24px;
    color: #757575;
  }
  :global(.rewards-header strong) {
    font-weight: normal;
    color: #363636;
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
