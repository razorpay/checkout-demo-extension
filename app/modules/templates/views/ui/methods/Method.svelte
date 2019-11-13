<script>
  // Props
  export let method = null; // Name of the method
  export let icon = null; // Override: icon. Picked from method if not overridden.
  export let title = null; // Override: title. Picked from method if not overridden.
  export let subtitle = null; // Override: subtitle. Picked from method if not overridden.

  // UI imports
  import SlottedOption from 'templates/views/ui/options/Slotted/Option.svelte';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import {
    getMethodNameForPaymentOption,
    getMethodDescription,
  } from 'checkoutframe/paymentmethods';

  const session = getSession();

  // Items to display
  const _icon = icon || session.themeMeta.icons[method];
  const _title = title || getMethodNameForPaymentOption(method, { session });
  const _subtitle = subtitle || getMethodDescription(method, { session });
</script>

<style>
  /* Container styles */
  :global(.new-method) {
    padding: 16px;
  }

  /* Icon styles */
  i {
    display: flex;
    margin-right: 16px;
    width: 24px;
    text-align: center;
  }

  i :global(svg) {
    height: 24px;
    width: auto;
  }

  /* Content styles */
  div[slot='title'] {
    margin: 0;
    font-weight: bold;
    font-size: 1rem;
    line-height: 1.1rem;
    color: #4f4f4f;
    text-transform: none;
  }

  div[slot='subtitle'] {
    margin: 4px 0 0 0;
    font-size: 0.8rem;
    line-height: 1rem;
    color: #828282;
  }
</style>

<SlottedOption className="new-method">
  <i slot="icon">
    {@html _icon}
  </i>
  <div slot="title">{_title}</div>
  <div slot="subtitle">{_subtitle}</div>
</SlottedOption>
