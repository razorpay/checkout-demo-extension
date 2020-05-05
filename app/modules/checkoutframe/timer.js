import Timer from 'ui/elements/Timer.svelte';

/**
 * returns a new svelte components mounted on `#bottom`
 * @param  {Number} expiry Absolute timestamp, to stop timer at
 * @param  {Function} onExpire callback to be invoked if timer expires.
 *                             Not fired if destroyed before that
 * @return {SvelteComponent}
 */
export default function showTimer(expiry, onExpire) {
  return new Timer({
    target: _Doc.querySelector('#bottom'),
    props: {
      expiry,
      onExpire,
    },
  });
}
