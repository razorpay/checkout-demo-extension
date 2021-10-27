<script>
  import { t } from 'svelte-i18n';
  import { fly, fade } from 'svelte/transition';
  import { loaderLabel, showLoader } from 'one_click_checkout/loader/store';
  import Icon from 'ui/elements/Icon.svelte';
  import { getIcons } from 'one_click_checkout/sessionInterface';

  const { rzp_logo } = getIcons();
</script>

{#if $showLoader}
  <div
    class="loader-backdrop"
    in:fade={{ duration: 250 }}
    out:fade={{ duration: 250 }}
  />
  <div class="card" transition:fly={{ duration: 250, y: 50 }}>
    <div class="content">
      <div class="activity-container">
        <div class="loading-indicator" />
        <div class="icon-container">
          <Icon icon={rzp_logo} />
        </div>
      </div>
      <span class="label">{$t($loaderLabel)}</span>
      <span class="rpay"><em>Razorpay</em></span>
    </div>
  </div>
{/if}

<style>
  .loader-backdrop {
    width: 100%;
    height: 100%;
    opacity: 0.2;
    position: absolute;
    background-color: black;
    top: 0;
    right: 0;
    z-index: 10000;
  }
  .card {
    z-index: 10001;
    width: 252px;
    height: 144px;
    background-color: white;
    color: black;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
  }
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    font-size: 12px;
  }

  .rpay {
    font-size: 11px;
    margin-top: 3px;
    font-weight: 900;
  }
  .label {
    cursor: default;
  }
  .activity-container {
    position: relative;
  }
  .icon-container {
    position: absolute;
    top: 1px;
    left: 1px;
  }
</style>
