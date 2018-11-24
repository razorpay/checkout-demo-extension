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
</div>

<script>
  export default {
    components: {
      ExpandableCard: 'templates/views/ui/ExpandableCard.svelte',
    },

    data: function () {
      return {
        expanded: -1
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

        const {
          select
        } = on;

        if (select) {
          select(plans[index]);
        }
      }
    },
  }
</script>
