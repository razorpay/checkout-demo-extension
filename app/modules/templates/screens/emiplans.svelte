<div
  id="form-emiplans"
  class="tab-content showable screen pad vertical-pad"
  class:has-callout={hasCallout}
>
  <h3>Select an EMI Plan</h3>

  <div class="emi-plans-list expandable-card-list">
    {#each plans as plan, index}
      <EmiPlanCard
        plan={plan}
        expanded={index === expanded}
        session={session}
        amount={amount}
        provider={provider}

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

  {#if branding}
    <Callout
      classes={['emi-branding-callout']}
      showIcon={false}
    >
      <span>Lending Partner</span>&nbsp;<img src={branding} alt={provider} />
    </Callout>
  {/if}
</div>

<script>
  export default {
    components: {
      Callout: 'templates/views/ui/Callout.svelte',
      EmiPlanCard: 'templates/tabs/emiplans/emiplancard.svelte'
    },

    computed: {
      showActions: ({ actions }) => actions && _Obj.keys(actions).length,
      hasCallout: ({ branding, actions, expanded }) => {
        const hasBranding = Boolean(branding);
        const hasAgreement = actions.showAgreement && expanded >= 0;

        return hasBranding || hasAgreement;
      },
    },

    data: function () {
      return {
        expanded: -1,
        provider: null,
        branding: null,
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


<style>
  .actionlink-container {
    margin: 12px 0;
  }

  :global(.emi-branding-callout)
    padding-left: 12px !important;
    span
      position: relative;
      left: unset;
      display: inline-block;
      vertical-align: middle;
      margin-right: 12px;
    img
      display: inline-block;
      vertical-align: middle;
      max-height: 24px;

  .has-callout
    padding-bottom: 64px;

  :global(.mobile)
    .has-callout
      padding-bottom: 120px;

</style>
