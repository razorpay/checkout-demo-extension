<script>
  // svelte imports
  import { fly, fade } from 'svelte/transition';

  // store imports
  import { showLoader } from 'one_click_checkout/account_modal/store';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { LOADING_LABEL } from 'one_click_checkout/loader/i18n/labels';
</script>

{#if $showLoader}
  <div
    class="loader-backdrop"
    in:fade={{ duration: 250 }}
    out:fade={{ duration: 250 }}
  />
  <div class="card" transition:fly={{ duration: 250, y: 50 }}>
    <div class="wrapper">
      <div class="bar" />
      <div class="content">
        <span class="label">{$t(LOADING_LABEL)}...</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .loader-backdrop {
    width: 100%;
    height: 100%;
    opacity: 0.2;
    position: absolute;
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
    position: absolute;
    bottom: 0;
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
    text-transform: capitalize;
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
    min-height: 5px;
    top: 0px;
    position: relative;
    animation-name: loader;
    animation-duration: 3s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    animation-direction: normal;
    background-color: #b88c45;
  }
</style>
