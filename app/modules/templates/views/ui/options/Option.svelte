<div
  class={classes}
  {...attributes}

  on:click="select(event)"
>
  <slot></slot>
</div>
<script>
  export default {
    data: function () {
      return {
        classes: [],
        data: {},
        attributes: {}
      };
    },

    computed: {
      classes: ({ type, classes = []}) => {
        return `option ${type} ${classes.join(' ')}`;
      }
    },

    methods: {
      select: function (event) {
        event.data = this.get().data;
        this.fire('select', event);
      }
    }
  }
</script>
