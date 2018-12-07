<Option
  {data}
  type={type}

  on:select="fire('select', event)"
>
  {#if icon}
    <OptionIcon icon={icon} />
  {/if}
  <div class="option-title"><slot></slot></div>
  {#if showRadio}
    <Radio checked={selected}/>
  {/if}
</Option>

<script>
  export default {
    components: {
      Option: 'templates/views/ui/options/Option.svelte',
      OptionIcon: 'templates/views/ui/options/OptionIcon.svelte',
      Radio: 'templates/views/ui/Radio.svelte',
    },

    computed: {
      type: function({selected}) {
        let activeClass = selected ? ' selected': '';

        return `radio-option${activeClass}`;
      }
    },

    data: function () {
      return {
        icon: null,
        showRadio: true,
        selected: false,
      };
    },
  }
</script>