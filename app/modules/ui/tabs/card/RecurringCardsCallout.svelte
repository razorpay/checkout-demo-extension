<script lang="ts">
  import { t } from 'svelte-i18n';
  import WarningIcon from './RecurringCardsWarningIcon.svelte';
  import { pushOverlay } from 'navstack';
  import RecurringCardsOverlay from './RecurringCardsOverlay.svelte';
  import {
    RECURRING_CARDS_LIMITED_SUPPORT,
    RECURRING_CARDS_VIEW_SUPPORTED_CARDS,
  } from 'ui/labels/callouts';

  function showSupportedCardsOverlay() {
    pushOverlay({
      component: RecurringCardsOverlay,
    });
  }
</script>

<p class="recurring-card-callout">
  <span class="warning-icon">&#x2139;</span>
  <!-- LABEL: Only limited cards support recurring payments as per RBI's new regulations. -->
  <span>
    {$t(RECURRING_CARDS_LIMITED_SUPPORT)}
    <!-- LABEL: View Supported cards -->
    <u on:click={showSupportedCardsOverlay}>
      {$t(RECURRING_CARDS_VIEW_SUPPORTED_CARDS)}
    </u>
  </span>
</p>

<style>
  .recurring-card-callout {
    background: rgba(255, 219, 92, 0.2);
    font-size: 12px;
    line-height: 14px;
    color: #cd8214;
    border: 1px solid rgba(255, 219, 92, 0.2);
    border-radius: 2px;
    padding: 8px;
    padding-left: 26px;
    position: relative;
  }
  u {
    cursor: pointer;
  }

  .warning-icon {
    font-size: 14px;
  }

  :global(.redesign) {
    .recurring-card-callout {
      line-height: 18px;
      color: var(--primary-text-color);
      padding: 10px 16px 10px 18px;
      display: flex;
      background: linear-gradient(89.97deg, #fff5d8 -1.19%, #fffaed 99.97%);
    }
    u {
      display: block;
      color: var(--primary-color);
      font-weight: 400;
      margin-top: 4px;
    }
    svg {
      margin-right: 10px;
    }
    .warning-icon {
      margin-right: 10px;
    }
  }
</style>
