<script>
  // Svelte importrs
  import { createEventDispatcher } from 'svelte';

  // Props
  export let method = null; // Name of the method
  export let icon = null; // Override: icon. Picked from method if not overridden.
  export let title = null; // Override: title. Picked from method if not overridden.
  export let subtitle = null; // Override: subtitle. Picked from method if not overridden.
  export let downtime = true; // Should we consider downtime?

  // UI imports
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import {
    getMethodDowntimeDescription,
    getMethodNameForPaymentOption,
    getMethodDescription,
  } from 'checkoutframe/paymentmethods';
  import { getDowntimes } from 'checkoutstore';

  const session = getSession();
  const dispatch = createEventDispatcher();

  const downtimes = getDowntimes().high.methods;
  let down = false;
  if (downtime) {
    if (/card$/.test(method)) {
      down = _Arr.contains(downtimes, 'card');
    } else if (method === 'gpay') {
      down = _Arr.contains(downtimes, 'upi');
    } else {
      down = _Arr.contains(downtimes, method);
    }
  }

  // Items to display
  const _title = title || getMethodNameForPaymentOption(method, { session });

  const icons = session.themeMeta.icons;
  let _icon;
  if (icon) {
    _icon = icon;
  } else {
    if (/card$/.test(method)) {
      _icon = icons['card'];
    } else {
      _icon = icons[method];
    }
  }

  let _subtitle;
  if (subtitle) {
    _subtitle = subtitle;
  } else if (down) {
    _subtitle = getMethodDowntimeDescription(method);
  } else {
    _subtitle = getMethodDescription(method, { session });
  }

  function select(event) {
    dispatch('select', {
      down,
      method,
    });
  }
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
    min-width: 24px;
    text-align: center;
  }

  i :global(.gpay-icon) {
    margin-left: 0;
    flex: 1 1 0;
  }

  i :global(svg) {
    height: 24px;
    flex: 1 1 0;
    width: auto;
  }

  /* Content styles */
  div[slot='title'] {
    margin: 0;
    font-weight: 600;
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

<SlottedOption
  className="new-method"
  defaultStyles={false}
  on:click={select}
  disabled={down}
  attributes={{ method }}>
  <i slot="icon">
    <Icon icon={_icon} />
  </i>
  <div slot="title">{_title}</div>
  <div slot="subtitle">{_subtitle}</div>
</SlottedOption>
