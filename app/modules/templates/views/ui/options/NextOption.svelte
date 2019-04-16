<Option
  {data}
  type="next-option {type}"

  on:select="select(event)"
>
  {#if icon}
    <OptionIcon icon={icon} />
  {/if}
  <div class="option-title"><slot></slot></div>
  {#if arrowText}
    <div class="option-arrow-text theme-highlight">{arrowText}</div>
  {/if}
</Option>

<script>
  export default {
    components: {
      Option: 'templates/views/ui/options/Option.svelte',
      OptionIcon: 'templates/views/ui/options/OptionIcon.svelte',
    },

    data: function () {
      return {
        arrowText: null,
        icon: null,
        data: {},
        type: '',
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
