<script lang="ts">
  // svelte imports
  import { onMount } from 'svelte';
  import { fly, fade } from 'svelte/transition';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { LOADING_LABEL } from 'one_click_checkout/loader/i18n/labels';

  // store imports
  import {
    loaderLabel,
    showLoader,
    loaderClass,
  } from 'one_click_checkout/loader/store';

  // utils imports
  import { isMobile } from 'common/useragent';

  let resizeBackdrop = false;
  let isKeyboardOpen = false;
  let layoutHeight;

  $: {
    if ($showLoader) {
      resizeBackdrop = !!document.getElementById('one-cc-cta');
    }
  }

  const getLoaderClass = (className) =>
    `${className} ${$loaderClass ? `${$loaderClass}-${className}` : ''}`;
  $: {
    if ($showLoader) {
      resizeBackdrop = !!document.getElementById('one-cc-cta');
    }
  }

  onMount(() => {
    layoutHeight = window.innerHeight;
    window.onresize = function () {
      // Assumption: On a mobile device, window height will change only when keyboard is shown/hidden
      if (window.innerHeight < layoutHeight && isMobile()) {
        isKeyboardOpen = true;
      } else {
        isKeyboardOpen = false;
      }
    };
  });
</script>

{#if $showLoader}
  <div
    class={getLoaderClass('loader-backdrop')}
    class:resize-backdrop={resizeBackdrop && !isKeyboardOpen}
    in:fade={{ duration: 250 }}
    out:fade={{ duration: 200 }}
  />
  <div
    class={getLoaderClass('card')}
    class:card-absolute={isKeyboardOpen}
    out:fly={{ duration: 200, y: 10 }}
  >
    <div class="wrapper">
      <div class="bar" />
      <div class="content">
        <span class="label">{$t($loaderLabel) || $t(LOADING_LABEL)}...</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .card.card-absolute {
    bottom: 0;
    position: absolute;
  }
  .loader-backdrop.resize-backdrop {
    height: calc(100% - 65px);
  }

  .loader-backdrop {
    width: 100%;
    height: 100%;
    position: absolute;
    opacity: 0.2;
    background-color: black;
    top: 0;
    right: 0;
    z-index: 5;
  }
  .card {
    width: 100%;
    height: 42px;
    color: var(--primary-text-color);
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: var(--font-weight-medium);
    box-shadow: 0px -1px 3px rgba(0, 0, 0, 0.08);
    background-color: #fef5e5;
    animation-name: slide-up;
    animation-duration: 0.2s;
    animation-timing-function: ease-out;
    animation-fill-mode: forwards;
    z-index: 5;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: var(--font-size-small);
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
    visibility: hidden;
    width: 50px;
    height: 5px;
    top: 0px;
    position: relative;
    animation-name: loader;
    /** delay should be same as duration of .card animation duration */
    animation-delay: 0.2s;
    animation-duration: 0.5s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    background-color: #b88c45;
  }

  @keyframes loader {
    0% {
      left: 0px;
      visibility: hidden;
    }
    100% {
      left: calc(100% - 50px);
      visibility: visible;
    }
  }

  @keyframes slide-up {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
