<script>
  // Svelte importrs
  import { createEventDispatcher } from 'svelte';

  // Props
  export let method = null; // Name of the method
  export let icon = null; // Override: icon. Picked from method if not overridden.
  export let title = null; // Override: title. Picked from method if not overridden.
  export let subtitle = null; // Override: subtitle. Picked from method if not overridden.
  export let downtime = true; // Should we consider downtime?

  // Store
  import { locale } from 'svelte-i18n';

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
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

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

  const icons = session.themeMeta.icons;
  const _icon = getIconForDisplay();

  let _subtitle;
  $: _subtitle = getSubtitleForDisplay($locale);

  let _title;
  $: _title = getTitleForDisplay($locale);

  function getSubtitleForDisplay(locale) {
    if (subtitle) {
      return subtitle;
    } else if (down) {
      return getMethodDowntimeDescription(method, locale);
    } else {
      return getMethodDescription(method, locale);
    }
  }

  function getTitleForDisplay(locale) {
    return title || getMethodNameForPaymentOption(method, locale);
  }

  function getIconForDisplay() {
    if (icon) {
      return icon;
    } else {
      if (/card$/.test(method)) {
        return icons['card'];
      } else {
        return icons[method];
      }
    }
  }

  function select() {
    Analytics.track('payment_method:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        method,
        down,
      },
    });

    if (down) {
      return;
    }

    dispatch('select');
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
