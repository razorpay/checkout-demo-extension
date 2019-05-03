<ExpandableCard
  badge={plan.badge}
  expanded={expanded}

  on:click="fire('click', event)"
>
  <span slot="title">{@html plan.text}</span>
  <span slot="detail">{@html plan.detail}</span>
</ExpandableCard>

<script>
  export default {
    components: {
      ExpandableCard: 'templates/views/ui/ExpandableCard.svelte',
    },
  }
</script>
