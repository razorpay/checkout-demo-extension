<script>
  import { t } from 'svelte-i18n';
  import { fly, fade } from 'svelte/transition';
  import { loaderLabel, showLoader } from 'one_click_checkout/loader/store';
  import { getTheme } from 'one_click_checkout/address/sessionInterface';
  import { LOADING_LABEL } from 'one_click_checkout/loader/i18n/labels';

  const theme = getTheme();
  let resizeBackdrop = false;

  $: {
    if ($showLoader) {
      resizeBackdrop = !!document.getElementById('one-cc-cta');
    }
  }
</script>

{#if $showLoader}
  <div
    class="loader-backdrop"
    class:resize-backdrop={resizeBackdrop}
    in:fade={{ duration: 250 }}
    out:fade={{ duration: 250 }}
  />
  <div class="card" transition:fly={{ duration: 250, y: 50 }}>
    <div class="wrapper">
      <div class="bar" />
      <div class="content">
        <span class="label">{$t($loaderLabel) || $t(LOADING_LABEL)}...</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .loader-backdrop.resize-backdrop {
    height: calc(100% - 96px);
  }

  .loader-backdrop {
    width: 100%;
    height: 100%;
    position: absolute;
    opacity: 0.2;
    background-color: black;
    top: 0;
    right: 0;
    z-index: 10000;
  }
  .card {
    z-index: 10001;
    width: 100%;
    height: 36px;
    color: #757575;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;
    box-shadow: 0px -1px 3px rgba(0, 0, 0, 0.08);
    background-color: #fef5e5;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 12px;
    width: 100%;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .label {
    cursor: default;
  }

  .wrapper {
    width: 100%;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .bar {
    width: 20%;
    height: 5px;
    top: 0px;
    position: relative;
    animation-name: loader;
    animation-duration: 3s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-direction: normal;
    background-color: #b88c45;
  }

  @keyframes loader {
    0% {
      left: 0px;
    }
    100% {
      left: 100%;
    }
  }
</style>
