import ApiDowntimeBanner from 'ui/elements/ApiDowntimeBanner.svelte';

/**
 * returns a new svelte components mounted on `#modal-inner`
 
 * @return {SvelteComponent}
 */
export default function showDowntimeBanner() {
  const banner = new ApiDowntimeBanner({
    target: _Doc.querySelector('#modal-inner'),
  });
  return banner;
}
