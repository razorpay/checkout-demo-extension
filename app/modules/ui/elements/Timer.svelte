<script>
  import { onDestroy } from 'svelte';
  // how long should timer be displayed
  export let expiry;
  export let onExpire;

  // string in mm:ss, to indicate time left
  let displayTime;

  const timerFn = () => {
    const millisecLeft = expiry - _.now();
    if (millisecLeft <= 0) {
      clear();
      onExpire();
    }
    const secLeft = Math.round(millisecLeft / 1000);
    displayTime =
      Math.floor(secLeft / 60) + ':' + ('0' + (secLeft % 60)).slice(-2);
  };
  timerFn();

  // refs to clear timeouts
  const interval = setInterval(timerFn, 1000);

  export function clear() {
    clearInterval(interval);
  }

  onDestroy(clear);
</script>

<div id="timeout">
  <i>&#x2139</i> This page will timeout in {displayTime} minutes
</div>
