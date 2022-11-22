import type { SvelteComponent } from 'svelte';

/***
 * Extract prop from svelte component instance
 * @param {SvelteComponent} svelteComponent
 * @param {String} selectedProp
 */
export const getComponentProps = (
  svelteComponent: SvelteComponent,
  selectedProp: string
) => {
  const index = svelteComponent?.$$?.props[selectedProp];
  if (index >= 0) {
    return svelteComponent.$$?.ctx[index];
  }
  return undefined;
};
