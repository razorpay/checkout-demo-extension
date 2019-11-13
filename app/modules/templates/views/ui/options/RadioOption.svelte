<script>
  // UI imports
  import Option from 'templates/views/ui/options/Option.svelte';
  import OptionIcon from 'templates/views/ui/options/OptionIcon.svelte';
  import Radio from 'templates/views/ui/Radio.svelte';

  // Props
  export let selected = false;
  export let data = {};
  export let reverse = false;
  export let icon = null;
  export let iconPlaceholder = '';
  export let showRadio = true;
  export let name = '';
  export let value = '';

  // Computed
  export let classes;

  $: {
    const allClasses = [];

    if (selected) {
      allClasses.push('selected');
    }

    if (icon || iconPlaceholder) {
      classes.push('has-icon');
    }

    classes = allClasses;
  }
</script>

<Option {data} {classes} {reverse} type="radio-option" on:select>
  {#if icon || iconPlaceholder}
    <OptionIcon {icon} placeholder={iconPlaceholder} />
  {/if}
  <div class="option-title">
    <slot />
  </div>
  {#if showRadio}
    <Radio checked={selected} {name} {value} />
  {/if}
</Option>
