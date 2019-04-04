{#if methodSupported}
  <div class="tab-content showable screen pad" id='form-{method}'>
    <slot></slot>
  </div>
{/if}

<script>
  import { getSession } from 'sessionmanager';

  export default {
    computed: {
      methodSupported: ({ method }) => getSession().methods[method]
    }
  }
</script>