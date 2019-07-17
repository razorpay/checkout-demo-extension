<Option
  {data}
  {classes}
  {reverse}
  type="radio-option"

  on:select="fire('select', event)"
>
  {#if icon || iconPlaceholder}
    <OptionIcon icon={icon} placeholder={iconPlaceholder} />
  {/if}
  <div class="option-title"><slot></slot></div>
  {#if showRadio}
    <Radio
      checked={selected}
      {name}
      {value}
    />
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
      classes: function({selected}) {
        const allClasses = [];

        if (selected) {
          allClasses.push('selected');
        }

        return allClasses;
      }
    },

    data: function () {
      return {
        icon: null,
        showRadio: true,
        selected: false,
        iconPlaceholder: '',
        reverse: false
      };
    },
  }
</script>
