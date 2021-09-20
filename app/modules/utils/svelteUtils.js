/**
 * @typedef {Object} SvelteComponent
 *
 * @property {Object} $$
 *   @property {Array} ctx
 *   @property {Object} props
 */

/***
 * Extract prop from svelte component instance
 * @param {SvelteComponent} svelteComponent
 * @param {String} selectedProp
 */
export const getComponentProps = (svelteComponent, selectedProp) => {
  const index = svelteComponent?.$$?.props[selectedProp];
  if (index >= 0) {
    return svelteComponent.$$?.ctx[index];
  }
  return undefined;
};
