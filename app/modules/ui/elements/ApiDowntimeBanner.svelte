<script>
  import { onDestroy } from 'svelte';
  // how long should timer be displayed
  export function clear() {
    clearInterval(interval);
    clearTimeout(timeout);
  }

  onDestroy(clear);
</script>

<div id="timeout">
  <b>We'll be back in a bit!</b>
  <div>
    We are undergoing scheduled maintenance to ensure you get the best
    experience. We'll be back at 28th Jan'21 03:30 AM IST
  </div>
</div>
