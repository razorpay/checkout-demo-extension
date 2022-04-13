<script>
  // svelte imports
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';

  // Components
  import TrustedBadgeIcon from './TrustedBadgeIcon.svelte';
  //Utils
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import {
    getTrustedBadgeHighlights,
    getTrustedBadgeAnaltyicsPayload,
  } from 'trusted-badge/helper';
  //i18n
  import {
    TRUSTED_BADGE_HEADER,
    TRUSTED_BADGE_HIGHLIGHT1,
    TRUSTED_BADGE_HIGHLIGHT2,
    TRUSTED_BADGE_HIGHLIGHT3,
  } from 'trusted-badge/i18n/labels';
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  import { RTB } from 'checkoutstore/rtb';
  import { hideRTBHighlightsExperiment } from 'trusted-badge/experiments';

  $: trustedBadgeHighlights = getTrustedBadgeHighlights($RTB);
  const shouldHideHighlights = hideRTBHighlightsExperiment.enabled();

  onMount(() => {
    if (sendAnalytics) {
      Analytics.track('RTB:show', {
        type: AnalyticsTypes.RENDER,
        data: getTrustedBadgeAnaltyicsPayload(),
      });
    }
  });

  let list;

  $: {
    list = [
      formatTemplateWithLocale(TRUSTED_BADGE_HIGHLIGHT1, {}, $locale),
      formatTemplateWithLocale(TRUSTED_BADGE_HIGHLIGHT2, {}, $locale),
      formatTemplateWithLocale(TRUSTED_BADGE_HIGHLIGHT3, {}, $locale),
    ];
  }

  export let isInfoVisible = false;

  export let sendAnalytics = true;
  function handleInfoClicked() {
    isInfoVisible = shouldHideHighlights ? false : !isInfoVisible;
    if (sendAnalytics) {
      Analytics.track('RTB:click', {
        type: AnalyticsTypes.BEHAV,
        data: {
          highlightsVisible: isInfoVisible,
          ...getTrustedBadgeAnaltyicsPayload(),
        },
      });
    }
  }
</script>

<div>
  {#if trustedBadgeHighlights}
    <trusted-badge>
      <div class="trusted-badge-wrapper" class:center={shouldHideHighlights}>
        <div
          class="trusted-badge-header-section"
          class:active={isInfoVisible}
          class:cursor-pointer={!shouldHideHighlights}
          on:click={handleInfoClicked}
          data-testid="trusted-badge"
        >
          <i slot="icon">
            <TrustedBadgeIcon />
          </i>
          <div class="trusted-badge-full-width">
            <div class="trusted-badge-header-labels">
              <div><b>{$t(TRUSTED_BADGE_HEADER)}</b></div>
            </div>
            {#if !shouldHideHighlights}
              <div class="trusted-badge-arrow">
                <i
                  class="arrow"
                  class:arrow-down={!isInfoVisible}
                  class:arrow-up={isInfoVisible}
                />
              </div>
            {/if}
          </div>
        </div>
        {#if isInfoVisible}
          <div
            data-testid="trusted-badge-info"
            class="trusted-badge-info-section"
            in:fade
            out:fade
          >
            {#each list as point, i}
              <div class="trusted-badge-list-item">
                <div
                  class="trusted-badge-list-text"
                  class:trusted-badge-border-top={i === 0}
                >
                  <div class="trusted-badge-list-point">{point}</div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </trusted-badge>
  {/if}
</div>

<style>
  .trusted-badge-info-section {
    margin-top: -6px;
    padding-bottom: 8px;
  }
  .trusted-badge-wrapper {
    padding: 5.5px 20px;
  }
  .trusted-badge-wrapper.center {
    display: flex;
    justify-content: center;
  }
  .trusted-badge-header-section {
    display: flex;
  }
  .trusted-badge-header-section.cursor-pointer {
    cursor: pointer;
  }
  .trusted-badge-header-labels {
    font-size: 14px;
    margin-top: 8px;
    margin-left: 6px;
    display: inline-block;
    line-height: 16px;
    color: #363636;
  }
  .trusted-badge-list-text {
    display: inline-block;
    font-size: 12px;
    line-height: 18px;
    color: #575757;
    margin: 9px 0 0 26px;
    width: 86%;
  }
  .trusted-badge-list-item {
    margin-left: 9px;
    position: relative;
  }
  .trusted-badge-arrow {
    float: right;
    cursor: pointer;
    margin-top: 4px;
  }
  .trusted-badge-full-width {
    width: 100%;
  }
  .trusted-badge-border-top {
    padding-top: 10px;
  }
  .trusted-badge-list-item > .trusted-badge-border-top::before {
    top: 26px !important;
  }
  :global(.screen) > :global(.screen-main) {
    padding-top: 0 !important;
  }
  .arrow {
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: 3px;
    transition: transform 0.4s ease-in-out;
  }
  .arrow-up {
    transform: rotate(-135deg);
    -webkit-transform: rotate(-135deg);
  }
  .arrow-down {
    transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
  }
  .trusted-badge-list-point {
    display: inline-block;
  }
  .trusted-badge-list-text::before {
    display: inline-block;
    position: absolute;
    content: '';
    height: 9px;
    width: 9px;
    background-image: url("data:image/svg+xml,%3Csvg width='9' height='9' viewBox='0 0 9 9' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='4.42105' cy='4.42105' r='4.42105' fill='%235FD988'/%3E%3Cpath d='M6.31535 3.1582L3.71009 5.76347L2.52588 4.57926' stroke='white' stroke-width='1.06028' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E%0A");
    background-repeat: no-repeat;
    top: 14px;
    left: 0;
  }
</style>
