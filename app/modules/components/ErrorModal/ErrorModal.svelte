<script lang="ts">
  import { AnalyticsV2State } from 'analytics-v2';
  import { MiscTracker } from 'misc/analytics/events';
  import { getOption } from 'razorpay';

  import { getSession } from 'sessionmanager';
  import { onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';

  import {
    contentStore,
    errorMessageCTA,
    loadedCTA,
    loadingState,
    secondaryLoadedCTA,
    subContentStore,
  } from './store';

  const session = getSession();
  let retryClick = false;

  export let onCTAClick: () => void;
  export let onSecondaryCTAClick: () => void;
  export let onBackPressed: () => void;

  onDestroy(() => {
    if (!$loadingState) {
      if (!retryClick) {
        MiscTracker.RETRY_VANISHED(
          AnalyticsV2State.selectedInstrumentForPayment
        );
      }
      MiscTracker.AFTER_RETRY_SCREEN({
        screenName: session.screen,
        retryCount: session.attemptCount,
      });
    }
  });

  let showLink = false;

  const redirectableMethods = ['card', 'netbanking', 'wallet'];

  const hideLinkForRedirect = Boolean(
    getOption('redirect') &&
      redirectableMethods.includes(session?.payload?.method)
  );

  $: showLink =
    Boolean($errorMessageCTA) && $loadingState && !hideLinkForRedirect;

  export function preventBack() {
    if (onBackPressed) {
      onBackPressed();
      return true;
    }
    return false;
  }

  function primaryClick() {
    retryClick = true;
    MiscTracker.RETRY_CLICKED(AnalyticsV2State.selectedInstrumentForPayment);
    preventBack();
  }
</script>

<div
  transition:fly={{ duration: 200, y: 20 }}
  id="error-modal"
  class:loading={$loadingState}
>
  <div class="omnichannel">
    <img
      style="width:35px;"
      src="https://cdn.razorpay.com/app/googlepay.svg"
      alt=""
    />
    <div id="overlay-close" on:click={preventBack} class="close">×</div>
  </div>
  <div class="content-container">
    <div class="error-heading">
      {@html $contentStore}
    </div>
    <div class="error-content">
      {@html $subContentStore}
    </div>
  </div>
  {#if $loadingState}
    <div class="loader-container">
      <div class="spin"><div /></div>
      <div class="spin spin2"><div /></div>
    </div>
  {/if}
  {#if showLink}
    <div>
      <span on:click={onCTAClick} class="link">{$errorMessageCTA}</span>
    </div>
  {/if}
  {#if !$loadingState}
    <div class="loaded-state-cta">
      <button on:click={primaryClick} class="primary-cta cta-button btn">
        {$loadedCTA}
      </button>
      {#if $secondaryLoadedCTA}
        <span on:click={onSecondaryCTAClick} class="secondary-cta">
          {$secondaryLoadedCTA}
        </span>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  .error-heading {
    color: var(--primary-color);
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    text-align: left;
  }

  .primary-cta {
    border-radius: 5px;
    width: 100%;
    text-transform: capitalize;
    font-size: 14px;
    font-weight: 600;
    border-radius: 6px;
  }

  .loaded-state-cta {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .secondary-cta {
    text-decoration: underline;
    margin-top: 15px;
    cursor: pointer;
    width: 100%;
  }

  #error-modal {
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    box-shadow: 0px -7px 10px 0px rgba(23, 26, 30, 0.15);
  }

  #error-modal.loading {
    min-height: 220px;
    justify-content: center;

    .error-heading {
      font-weight: 400;
      color: inherit;
    }

    .error-heading {
      text-align: center;
    }
  }

  .error-content {
    white-space: normal;
    line-height: 18px;
    font-size: 14px;
    color: #8d97a1;
    text-align: left;
    padding: 0;
    margin-top: 10px;

    &:empty {
      display: none;
    }
  }

  .loader-container {
    position: relative;
    margin-bottom: 16px;
  }

  .spin2 {
    position: absolute;
    top: 0;
    margin: auto !important;
    left: 0;
    right: 0;
  }

  .error-heading:empty + .error-content {
    margin-top: 0;
  }

  .content-container {
    margin-bottom: 20px;
  }
</style>
