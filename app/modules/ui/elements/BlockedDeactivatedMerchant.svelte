<script>
  import CTA from 'ui/elements/CTA.svelte';
  import { getSession } from 'sessionmanager';
  const session = getSession();
  function onCloseCick() {
    session.closeAndDismiss();
  }
</script>

<style>
  #downtime-banner {
    padding: 20px;
    font-size: 16px;
    line-height: 20px;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
  }
</style>

<div id="downtime-banner">
  <div>
    There is a temporary block placed on the account currently because of which
    new payment operations are put on hold. If you are seeing this message
    unexpectedly, please contact the site admin regarding the issue.
  </div>
  <CTA on:click={onCloseCick}>CLOSE</CTA>
</div>
