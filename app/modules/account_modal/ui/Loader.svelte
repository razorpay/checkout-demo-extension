<script lang="ts">
  // svelte imports
  import { fly, fade } from 'svelte/transition';

  // store imports
  import { showLoader } from 'account_modal/store';

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
  <div class="card" transition:fly|local={{ duration: 250, y: 50 }}>
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
    background: rgba(7, 38, 84, 0.4);
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
    width: 50px;
    height: 5px;
    top: 0px;
    position: relative;
    animation-name: loader;
    animation-duration: 0.5s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    background-color: #b88c45;
  }

  @keyframes loader {
    0% {
      left: 0px;
    }
    100% {
      left: calc(100% - 50px);
    }
  }

  :global(.mobile) .card {
    bottom: 0;
  }
</style>
