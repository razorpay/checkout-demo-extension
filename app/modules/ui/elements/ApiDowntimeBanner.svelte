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
  #downtime-banner div {
    margin-top: 20px;
  }
</style>

<div id="downtime-banner">
  <strong>We'll be back in a bit!</strong>
  <div>
    We are undergoing scheduled maintenance to ensure you get the best
    experience. We'll be back at 28th Jan'21 03:30 AM IST
  </div>
  <CTA on:click={onCloseCick}>CLOSE</CTA>
</div>
