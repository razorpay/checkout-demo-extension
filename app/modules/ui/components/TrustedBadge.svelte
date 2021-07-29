<script>
  // svelte imports
  import { fade } from 'svelte/transition';
  import { onMount } from 'svelte';

  // Components
  import Icon from 'ui/elements/Icon.svelte';

  //Utils
  import { getSession } from 'sessionmanager';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  //i18n
  import {
    TRUSTED_BADGE_HEADER,
    TRUSTED_BADGE_HIGHLIGHT1,
    TRUSTED_BADGE_HIGHLIGHT2,
    TRUSTED_BADGE_HIGHLIGHT3,
  } from 'ui/labels/trusted-badge';
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  import { getMonthDiff } from 'utils/date';

  //props
  export let nos;
  let {
    customers_served: customersNo,
    active_since: securedTime,
    latest_dispute_at: noFraudTime,
  } = nos || {};
  noFraudTime = noFraudTime || securedTime;
  securedTime = getMonthDiff(securedTime);
  noFraudTime = getMonthDiff(noFraudTime);

  onMount(() => {
    const rtb_nos = {
      customers_served: nos.customers_served,
      active_since: nos.active_since,
      latest_dispute_at: nos.latest_dispute_at,
    };
    Analytics.setMeta('RTB:info', rtb_nos);
    Analytics.track('RTB:show', {
      type: AnalyticsTypes.RENDER,
    });
  });

  let list;

  $: {
    list = [
      formatTemplateWithLocale(
        TRUSTED_BADGE_HIGHLIGHT1,
        { customersNo },
        $locale
      ),
      formatTemplateWithLocale(
        TRUSTED_BADGE_HIGHLIGHT2,
        { securedTime },
        $locale
      ),
      formatTemplateWithLocale(
        TRUSTED_BADGE_HIGHLIGHT3,
        { noFraudTime },
        $locale
      ),
    ];
  }
  const session = getSession();
  const icons = session.themeMeta.icons;

  export let isInfoVisible = false;

  function handleInfoClicked() {
    isInfoVisible = !isInfoVisible;
    Analytics.track('RTB:click', {
      type: AnalyticsTypes.BEHAV,
      data: {
        highlightsVisible: isInfoVisible,
      },
    });
  }
</script>

<trusted-badge>
  <div class="trusted-badge-wrapper">
    <div class="trusted-badge-header-section" on:click={handleInfoClicked}>
      <i slot="icon">
        <Icon icon={icons.trusted_badge} />
      </i>
      <div class="trusted-badge-full-width">
        <div class="trusted-badge-header-labels">
          <div><b>{$t(TRUSTED_BADGE_HEADER)}</b></div>
        </div>
        <div class="trusted-badge-arrow">
          {#if !isInfoVisible}
            <i class="arrow arrow-down" />
          {:else}<i class="arrow arrow-up" />{/if}
        </div>
      </div>
    </div>
    {#if isInfoVisible}
      <div class="trusted-badge-info-section" in:fade out:fade>
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

<style>
  .trusted-badge-info-section {
    margin-top: -6px;
    padding-bottom: 8px;
  }
  .trusted-badge-wrapper {
    padding: 8px 20px;
  }
  .trusted-badge-header-section {
    display: flex;
    cursor: pointer;
  }
  .trusted-badge-header-labels {
    font-size: 16px;
    margin-top: 10px;
    margin-left: 12px;
    display: inline-block;
    line-height: 16px;
  }
  .trusted-badge-list-text {
    display: inline-block;
    font-size: 12px;
    line-height: 18px;
    color: #575757;
    margin: 10px 0 0 24px;
    width: 86%;
  }
  .trusted-badge-list-item {
    margin-left: 12px;
    position: relative;
  }
  .trusted-badge-header-labels > span {
    font-size: 11px;
  }
  .trusted-badge-arrow {
    float: right;
    cursor: pointer;
    margin-top: 10px;
  }
  .trusted-badge-full-width {
    width: 100%;
  }
  .trusted-badge-border-top {
    padding-top: 16px;
  }
  .trusted-badge-list-item > .trusted-badge-border-top::before {
    top: 32px !important;
  }
  :global(.screen) > :global(.screen-main) {
    padding-top: 0 !important;
  }
  .arrow {
    border-width: 0 2px 2px 0;
    display: inline-block;
    padding: 3px;
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
    background: url('https://cdn.razorpay.com/rtb/ticks_filled.svg');
    background-repeat: no-repeat;
    top: 16px;
    left: 0;
  }
</style>
