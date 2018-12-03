<Option
  {data}
  type="next-option"

  on:select="select(event)"
>
  {#if icon}
    <div class="option-icon">
      <img src={icon} alt={title}>
    </div>
  {/if}
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

    data: function () {
      return {
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
