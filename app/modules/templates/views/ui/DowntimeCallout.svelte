<Callout
  type={calloutType}
  classes={['downtime-callout']}
  showIcon={false}
>
  <slot></slot>
</Callout>

<script>

export default {

  components: {
    Callout: 'templates/views/ui/Callout.svelte'
  },

  computed: {
    calloutType: ({ isHighSeverity }) => isHighSeverity ? 'error' : 'warning',
  }

}

</script>
