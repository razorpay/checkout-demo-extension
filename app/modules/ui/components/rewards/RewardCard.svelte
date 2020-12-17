<script>
  //Utils
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  // props
  export let logo;
  export let reward_id;
  export let name;

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
    flex-wrap: wrap;
  }
  :global(.mobile) .reward-card {
    height: 177px;
    width: 189px;
    margin-right: 20px;
  }
  .full-width {
    width: 100%;
  }
  .reward-logo {
    max-width: 50px;
  }
  :global(.mobile) .reward-logo {
    width: 100px;
    max-width: 100px;
  }
  :global(.mobile) .reward-text {
    font-size: 16px;
  }
  .reward-text {
    font-size: 12px;
  }
  .flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo-container {
    height: 80%;
  }
  .reward-text {
    height: 20%;
  }
</style>

<div class="carousel-slide reward-card" on:click={handleCardClick}>
  <div class="full-width logo-container flex-center">
    <img class="reward-logo" src={logo} alt="Reward Logo" />
  </div>
  <div class="full-width reward-text flex-center"><b>{name}</b></div>
</div>
