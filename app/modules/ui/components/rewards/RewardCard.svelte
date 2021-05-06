<script>
  //Utils
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  // props
  export let logo;
  export let reward_id;
  export let name;

  function handleCardClick() {
    Analytics.track('rewards:card:click', {
      type: AnalyticsTypes.BEHAV,
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
    height: 132px;
    width: 132px;
    border-radius: 5px;
    padding: 10px;
    box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.2);
    border-radius: 3px;
    background: linear-gradient(222.44deg, #F0F0F0 3.74%, #FBFBFB 98.79%);
    flex-shrink: 0;
    flex-wrap: wrap;
    z-index: 100;
    position: relative;
  }
  .full-width {
    width: 100%;
  }
  .reward-logo {
    max-width: 100%;
    max-height: 100%;
  }
  .reward-text {
    font-size: 16px;
    line-height: 1.4;
    margin: 20px 0;
  }
  .flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo-container {
    max-width: 68%;
    max-height: 68%;
  }
  .rewards-desc {
    width: 85%;
  }
</style>

<div class="reward-card-container">
  <div class="full-width reward-card-container flex-center">
    <div class="reward-card" on:click={handleCardClick}>
      <div class="full-width logo-container flex-center">
        <img class="reward-logo" src={logo} alt="Reward Logo" />
      </div>
    </div>
  </div>
  <div class="full-width reward-text flex-center"><div class="rewards-desc">{name}</div></div>
</div>