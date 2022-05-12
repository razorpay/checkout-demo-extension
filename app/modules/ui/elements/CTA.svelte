<script>
  import { afterUpdate, createEventDispatcher } from 'svelte';
  import { cta, isCtaShown, showCta, hideCta } from 'checkoutstore/cta';
  import * as _El from 'utils/DOM';
  // if passed, creates an exclusive control on showing/hiding
  // of #footer for the lifecycle of <CTA>
  // expects Boolean
  export let show = true;
  export let disabled = false;
  const dispatch = createEventDispatcher();

  /**
   * on creation, we display the #footer to render this component in
   * we need to store if #footer was hidden previously or not
   * this is to hide it again after unmount in case it was hidden previously
   *
   * If you render a second <CTA>, wasCtaShown will remain true for it and
   * no invoking of showCta/hideCta during the lifecycle
   *
   * We're assuming stack (LIFO) of <CTA> throughout
   * e.g. <Netbanking> has a child <CTA>Pay</CTA>
   * we render <Offers> having <CTA>Apply</CTA> on top of it
   * can't have <Netbanking> destroyed without <Offers> being destroyed first
   * that may mess up with wasCtaShown
   * this is until #footer has been completely migrated to <CTA>
   * and we're able to determine at any given time if #footer needs to be shown or not
   */
  function replaceNode(node) {
    document.querySelector('#footer').appendChild(node);
    const wasCtaShown = isCtaShown();
    if (!wasCtaShown && show) {
      showCta();
    } else if (wasCtaShown && !show) {
      hideCta();
    }

    return {
      destroy() {
        wasCtaShown ? showCta() : hideCta();
        _El.detach(node);
      },
    };
  }

  afterUpdate(() => {
    show ? showCta() : hideCta();
  });
</script>

<span
  use:replaceNode
  on:click={(e) => {
    if (disabled) {return;}
    dispatch('click', e);
  }}
  class:disabled
>
  <slot>{$cta}</slot>
</span>
