<div id="payment-options" class="grid clear count-{methods.length}">
  {#each methods as method}
    <GridMethod
      {...method}

      on:select="selectMethod(event)"
    />
  {/each}
</div>

<script>
  import { getSession } from 'sessionmanager';
  import Store from 'checkoutframe/store';
  import { getMethodDescription } from 'checkoutframe/paymentmethods';
  import { getMethodDowntimeDescription } from 'checkoutframe/downtimes';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  export default {
    components: {
      GridMethod: './GridMethod.svelte',
    },

    computed: {
      methods: ({ session, avail_methods }) => {
        const methods = session.methods;
        const o = session.get;
        const icons = session.themeMeta.icons;
        let AVAIL_METHODS = _Obj.clone(avail_methods);
        let retMethods = [];

        const downtimes = Store.get().downtimes || {};
        const down = downtimes.disabled || [];

        if (o('theme.debit_card')) {
          AVAIL_METHODS = _Arr.remove(AVAIL_METHODS, 'card');
          AVAIL_METHODS = ['credit_card', 'debit_card'].concat(AVAIL_METHODS);
        }

        _Arr.loop(AVAIL_METHODS, method => {
          if (methods[method]) {
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
              title: session.tab_titles[method],
              description,
              down: isDown,
              downMessage: getMethodDowntimeDescription(method, {
                availableMethods: AVAIL_METHODS,
              }),
            });
          }
        });

        return retMethods;
      },
    },
    methods: {
      selectMethod: (event) => {
        const {
          down,
          method = '',
        } = event.data;

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

        getSession().switchTab(method);
      }
    },
  };
</script>
