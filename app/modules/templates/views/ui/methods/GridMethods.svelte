<div id="payment-options" class="grid clear count-{methods.length}">
  {#each methods as method}
    <div class="payment-option item" tab="{method.method}"
      on:click="switchTab(method.method)">
      <label>
        <i>{@html method.icon}</i> {method.title}
        <span class="desc">{method.description}</span>
      </label>
    </div>
  {/each}
</div>

<script>
  import { getSession } from 'sessionmanager';
  import { getMethodDescription } from 'checkoutframe/paymentmethods';

  export default {
    computed: {
      methods: ({ session, avail_methods }) => {
        const methods = session.methods;
        const o = session.get;
        const icons = session.themeMeta.icons;
        let AVAIL_METHODS = _Obj.clone(avail_methods);
        let retMethods = [];

        if (o('theme.debit_card')) {
          AVAIL_METHODS = _Arr.remove(AVAIL_METHODS, 'card');
          AVAIL_METHODS = ['credit_card', 'debit_card'].concat(AVAIL_METHODS);
        }

        _Arr.loop(AVAIL_METHODS, method => {
          if (methods[method]) {
            let icon = icons[method];
            if (/card$/.test(method)) {
              icon = icons['card'];
            }

            const description = getMethodDescription(method, {
              session,
            });

            retMethods.push({
              method,
              icon: icon,
              title: session.tab_titles[method],
              description,
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
