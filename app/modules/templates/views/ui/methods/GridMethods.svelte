<div id="payment-options" class="grid clear count-{methods.length}">
  {#each methods as method}
    <GridMethod
      method={method}

      on:click="switchTab(method.method)"
    />
  {/each}
</div>

<script>
  import { getSession } from 'sessionmanager';
  import Store from 'checkoutframe/store';

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

            retMethods.push({
              method,
              icon: icon,
              title: session.tab_titles[method],
              down: isDown,
              /* TODO: add descriptions for each tab */
            });
          }
        });

        return retMethods;
      },
    },
    methods: {
      switchTab: tab => getSession().switchTab(tab),
    },
  };
</script>
