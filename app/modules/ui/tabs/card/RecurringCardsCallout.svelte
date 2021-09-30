<script>
  /* global showOverlay, hideRecurringCardsOverlay */

  import Icon from 'ui/elements/Icon.svelte';
  import warningIcon from 'card/icons/recurring-callout-warning';
  import RecurringCardsOverlay from './RecurringCardsOverlay.svelte';

  const overlayTarget = _Doc.querySelector('#recurring-cards-wrap');
  let overlayView;

  function showSupportedCardsOverlay() {
    if (!overlayView) {
      overlayView = new RecurringCardsOverlay({
        target: overlayTarget,
        props: { close: hideRecurringCardsOverlay },
      });
    }

    showOverlay([overlayTarget]);
  }
</script>

<p class="recurring-card-callout">
  <!-- Warning Icon -->
  <span class="callout-icon">
    <Icon icon={warningIcon} />
  </span>

  <!-- Callout Text -->
  <span
    >Only limited cards support recurring payments due to new payment
    regulations by RBI.</span
  >

  <!-- View Supported cards -->
  <a on:click|preventDefault={showSupportedCardsOverlay}>View supported cards</a
  >
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
