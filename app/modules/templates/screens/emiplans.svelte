<div id="form-emiplans" class="tab-content showable screen pad vertical-pad">
  <h3>Select an EMI Plan</h3>

  <div class="emi-plans-list expandable-card-list">
    {#each plans as plan, index}
      <ExpandableCard
        badge={plan.badge}
        detail={plan.detail}
        expanded={index === expanded}
        title={plan.text}

        on:click="expand(index)"
      />
    {/each}
  </div>

  <div
    class="emi-plans-actions actionlink-container"

    class:hidden="!showActions"
  >
    {#if actions.viewAll}
      <div class="actionlink theme-highlight" on:click="invoke('viewAll', event)">View all EMI Plans</div>
    {/if}
    {#if actions.payWithoutEmi}
      <div class="actionlink theme-highlight" on:click="invoke('payWithoutEmi', event)">Pay without EMI</div>
    {/if}
  </div>
  {#if actions.showAgreement && expanded >= 0}
    <div class="callout drishy" on:click="invoke('viewAgreement', event)">
      <span>&#x2139;</span>
      By clicking on Pay, you agree to the terms of our&nbsp;
      <span class="theme-highlight">Loan Agreement</span>
    </div>
  {/if}
</div>

<style>
  .actionlink-container {
    margin: 12px 0;
  }
</style>

<script>
  export default {
    components: {
      ExpandableCard: 'templates/views/ui/ExpandableCard.svelte',
    },

    computed: {
      showActions: ({ actions }) => actions && _Obj.keys(actions).length,
    },

    data: function () {
      return {
        expanded: -1,
      };
    },

    methods: {
      expand: function (index) {
        this.set({
          expanded: index
        });

        const {
          on = {},
          plans
        } = this.get();

        this.invoke('select', plans[index]);
      },

      invoke: function (type, event) {
        const {
          on = {},
        } = this.get();

        if (on[type]) {
          on[type](event);
        }
      },
    },
  }
</script>
