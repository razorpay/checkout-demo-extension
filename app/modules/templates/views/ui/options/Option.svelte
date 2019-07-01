<div
  class={optionClasses}
  {tabindex}
  {...attributes}

  on:click="select(event)"
  on:keydown="selectOnKeydown(event)"

  ref:container
>
  <slot></slot>
</div>
<script>
  export default {
    data: function () {
      return {
        classes: [],
        data: {},
        attributes: {},
        tabindex: -1,
      };
    },

    computed: {
      optionClasses: ({ type, classes }) => {
        return `option ${type} ${classes.join(' ')}`;
      }
    },

    methods: {
      /**
       * When the element is focused on,
       * and the user wants to select it,
       * the user will press Space or Enter.
       *
       * Simulate a "select" event when this happens.
       */
      selectOnKeydown: function (event) {
        /**
         * If the element has more focusable elements
         * inside it, pressing space on them will also
         * invoke this function.
         * So, make sure that the element that currently
         * has focus is the same as the container.
         */
        if (this.refs.container !== document.activeElement) {
          return;
        }

        const key = _.getKeyFromEvent(event);

        // 13 = Return, 32 = Space
        if (key === 13 || key === 32) {
          this.select(event);
        }
      },

      select: function (event) {
        event.data = this.get().data;
        this.fire('select', event);
      }
    }
  }
</script>
