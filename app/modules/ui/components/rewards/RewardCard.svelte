<script>
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';

  // i18n
  import { t } from 'svelte-i18n';
  import { REWARDS_HEADER, REWARDS_SUB_TEXT } from 'ui/labels/rewards';

  // // props
  export let reward;
</script>

<style>
  .reward-card {
    display: inline-block;
    height: 116px;
    width: 72px;
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.18);
    border-radius: 5px;
    padding: 10px;
  }
  :global(.mobile) .reward-card {
    height: 177px;
    width: 189px;
  }
</style>

<div class="reward-card">{reward.name}</div>
