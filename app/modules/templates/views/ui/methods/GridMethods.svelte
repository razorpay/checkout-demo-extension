<script>
  // UI imports
  import GridMethod from './GridMethod.svelte';

  // Utils imports
  import { getSession } from 'sessionmanager';
  import DowntimesStore from 'checkoutstore/downtimes';
  import {
    getMethodDescription,
    getMethodDowntimeDescription,
    getMethodNameForPaymentOption,
  } from 'checkoutframe/paymentmethods';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  // Props
  export let avail_methods;

  // Computed
  export let methods;

  const session = getSession();

  $: {
    const sessionMethods = session.methods;
    const o = session.get;
    const icons = session.themeMeta.icons;
    let AVAIL_METHODS = _Obj.clone(avail_methods);
    let retMethods = [];

    const downtimes = DowntimesStore.get() || {};
    const down = downtimes.disabled || [];

    if (o('theme.debit_card')) {
      AVAIL_METHODS = _Arr.remove(AVAIL_METHODS, 'card');
      AVAIL_METHODS = ['credit_card', 'debit_card'].concat(AVAIL_METHODS);
    }

    _Arr.loop(AVAIL_METHODS, method => {
      if (sessionMethods[method]) {
        let icon = icons[method];
        let isDown = _Arr.contains(down, method);
        if (/card$/.test(method)) {
          icon = icons['card'];
          isDown = _Arr.contains(down, 'card');
        }

        const description = getMethodDescription(method, {
          session,
        });

        retMethods.push({
          method,
          icon: icon,
          title: getMethodNameForPaymentOption(method, {
            session,
          }),
          description,
          down: isDown,
          downMessage: getMethodDowntimeDescription(method, {
            availableMethods: AVAIL_METHODS,
            downMethods: downtimes.disabled,
          }),
        });
      }
    });

    methods = retMethods;
  }

  export function selectMethod(event) {
    const { down, method = '' } = event.data;

    const target = event.currentTarget;
    let disabled = _El.hasClass(target, 'disabled');

    Analytics.track('payment_method:select', {
      type: AnalyticsTypes.BEHAV,
      data: {
        disabled,
        method,
      },
    });

    if (down || disabled) {
      return;
    }

    session.switchTab(method);
  }
</script>

<div id="payment-options" class="grid clear count-{methods.length}">
  {#each methods as method}
    <GridMethod {...method} on:select={selectMethod} />
  {/each}
</div>
