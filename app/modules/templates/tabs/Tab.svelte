{#if methodSupported}
  <div class="tab-content showable screen" id='form-{method}' class:pad {down}>
    <slot></slot>
  </div>
{/if}

<script>
  import { getSession } from 'sessionmanager';

  export default {
    computed: {
      methodSupported: ({ method, overrideMethodCheck }) => overrideMethodCheck || getSession().methods[method]
    },

    data: () => ({
      overrideMethodCheck: false,
      pad: true,
      down: false,
    })
  }
</script>
