<div
  class={type}
  {...attributes}

  on:click="select(event)"
>
  <slot></slot>
</div>
<script>
  export default {
    data: function () {
      return {
        data: {}
      };
    },

    computed: {
      type: ({ type }) => `option ${type}`,
    },

    methods: {
      select: function (event) {
        event.data = this.get().data;
        this.fire('select', event);
      }
    }
  }
</script>
