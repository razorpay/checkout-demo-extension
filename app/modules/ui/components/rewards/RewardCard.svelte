<script>
  //Utils
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  // props
  export let logo;
  export let reward_id;

  function handleCardClick() {
    Analytics.track('rewards:icon:show', {
      type: AnalyticsTypes.RENDER,
      data: {
        reward_id,
      },
    });
  }
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

<div class="carousel-slide reward-card" on:click={handleCardClick}>
  <img src={logo} alt="Reward Logo" />
</div>
