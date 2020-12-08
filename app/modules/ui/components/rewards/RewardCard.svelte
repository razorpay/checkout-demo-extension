<script>
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';

  // i18n
  import { t } from 'svelte-i18n';
  import { REWARDS_HEADER, REWARDS_SUB_TEXT } from 'ui/labels/rewards';

  // // props
  export let logo;
</script>

<style>
  .reward-card {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 116px;
    width: 72px;
    border-radius: 5px;
    padding: 10px;
    background: linear-gradient(199.72deg, #ffffff 1.23%, #f8f8f8 99.45%);
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.18);
    border-radius: 5px;
    flex-shrink: 0;
  }
  :global(.mobile) .reward-card {
    height: 177px;
    width: 189px;
    margin-right: 20px;
  }
</style>

<div class="carousel-slide reward-card">
  <img src={logo} alt="Reward Logo" />
</div>
