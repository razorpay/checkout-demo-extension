<NextOption
  {attributes}
  data={method}
  {icon}
  {classes}

  on:select="selectMethod(event)"
>
  <span class="title">{title}</span>
  {#if down}
    <span class="downtime">
      <Tooltip
        bindTo="#list-options"
        class="downtime-tooltip"
        align={['top', 'right']}
      >
        {downMessage}
      </Tooltip>
    </span>
  {/if}
</NextOption>

<script>

  export default {
    components: {
      NextOption: 'templates/views/ui/options/NextOption.svelte',
      Tooltip: 'templates/views/ui/Tooltip.svelte',
    },

    computed: {
      attributes: function ({ method, down }) {
        return {
          tab: method,
          down,
        };
      },

      classes: function ({ down }) {
        const classes = [];

        if (down) {
          classes.push('has-tooltip');
        }

        return classes;
      }
    },

    methods: {
      selectMethod: function (event) {
        const {
          down,
          method,
        } = this.get();

        event.data = {
          down,
          method,
        };

        this.fire('select', event);
      }
    }
  }

</script>
