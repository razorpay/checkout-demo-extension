{#if methodSupported}
  <div
    class="tab-content showable screen"
    id='form-{method}'
    class:pad
    class:hasMessage

    {down}
  >
    <slot></slot>
  </div>
{/if}

<style>

.hasMessage {
  padding-bottom: 56px;
}

</style>

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
