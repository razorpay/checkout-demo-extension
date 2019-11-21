<script>
  // Utils imports
  import { getSession } from 'sessionmanager';
  import Analytics from 'analytics';

  const session = getSession();

  function track() {
    Analytics.track('offers:list_view:screen:' + (session.screen || 'home'), {
      data: session.offers.appliedOffer,
    });
  }
</script>

<style>
  :global(.has-offers) .offers-portal {
    display: block !important;
    position: static;
    transform: none !important;
    bottom: unset;
  }
</style>

<div class="offers-container offers-portal" on:click={track} />
