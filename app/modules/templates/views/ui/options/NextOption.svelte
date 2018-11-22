<Option
  attributes={attributes}
  {data}
  type="next-option"

  on:select="select(event)"
>
  <div class="option-title">{title}</div>
  {#if arrowText}
    <div class="option-arrow-text theme-highlight">{arrowText}</div>
  {/if}
</Option>

<script>
  export default {
    components: {
      Option: 'templates/views/ui/options/Option.svelte',
    },

    computed: {
      attributes: function ({ icon }) {
        const attribs = {};

        if (icon) {
          attribs.style = `background-image: url('${icon}');`;
        }

        return attribs;
      }
    },

    data: function () {
      return {
        icon: null,
        arrowText: null,
      };
    },

    methods: {
      select: function (e) {
        e.option = this.get().data;

        this.fire('select', e);
      }
    },
  }
</script>
