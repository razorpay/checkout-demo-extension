<Callout
  type={calloutType}
  classes={['downtime-callout']}
  showIcon={false}
>
  <b>{issuer}</b> {message}
</Callout>

<script>

const DowntimeMessages = {
  netbanking: {
    error: ' accounts are temporarily unavailable right now. Please select another bank.',
    warning: ' accounts are experiencing low success rates.'
  }
};

export default {

  components: {
    Callout: 'templates/views/ui/Callout.svelte'
  },

  computed: {
    calloutType: ({ isHighSeverity }) => isHighSeverity ? 'error' : 'warning',
    message: ({ method, calloutType }) => DowntimeMessages[method][calloutType]
  }

}

</script>
