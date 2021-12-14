<script>
  import { onDestroy } from 'svelte';
  import { t } from 'svelte-i18n';
  import Icon from 'ui/elements/Icon.svelte';
  import { getSession } from 'sessionmanager';

  import warningIcon from 'card/icons/recurring-callout-warning';
  import RecurringCardsOverlay from './RecurringCardsOverlay.svelte';
  import {
    RECURRING_CARDS_LIMITED_SUPPORT,
    RECURRING_CARDS_VIEW_SUPPORTED_CARDS,
  } from 'ui/labels/callouts';

  const session = getSession();
  const overlayTarget = document.querySelector('#recurring-cards-wrap');
  let overlayView = new RecurringCardsOverlay({
    target: overlayTarget,
    props: { close: session.hideRecurringCardsOverlay },
  });

  function showSupportedCardsOverlay() {
    session.showOverlay([overlayTarget]);
  }

  onDestroy(() => {
    overlayView.$destroy();
  });
</script>

<p class="recurring-card-callout">
  <!-- Warning Icon -->
  <span class="callout-icon">
    <Icon icon={warningIcon} />
  </span>

  <!-- LABEL: Only limited cards support recurring payments as per RBI's new regulations -->
  <span>
    {$t(RECURRING_CARDS_LIMITED_SUPPORT)}
    <!-- LABEL: View Supported cards -->
    <a on:click|preventDefault={showSupportedCardsOverlay}>
      {$t(RECURRING_CARDS_VIEW_SUPPORTED_CARDS)}
    </a>
  </span>
</p>

<style>
  .recurring-card-callout {
    display: flex;
    flex-direction: column;
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

  .callout-icon {
    position: absolute;
    left: 4px;
  }

  a {
    text-decoration: underline;
    margin-top: 4px;
    align-self: flex-start;
  }
</style>
