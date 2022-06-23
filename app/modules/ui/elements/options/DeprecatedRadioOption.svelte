<script lang="ts">
  // UI imports
  import DeprecatedOption from 'ui/elements/options/DeprecatedOption.svelte';
  import OptionIcon from 'ui/elements/options/OptionIcon.svelte';
  import Radio from 'ui/elements/Radio.svelte';

  // Props
  export let selected = false;
  export let data = {};
  export let reverse = false;
  export let icon = null;
  export let iconPlaceholder = '';
  export let showRadio = true;
  export let name = '';
  export let value = '';
  export let showArrow = false;

  // Computed
  export let classes;

  $: {
    const allClasses = [];

    if (selected) {
      allClasses.push('selected');
    }

    if (icon || iconPlaceholder) {
      allClasses.push('has-icon');
    }

    classes = allClasses;
  }
</script>

<DeprecatedOption {data} {classes} {reverse} type="radio-option" on:select>
  {#if icon || iconPlaceholder}
    <OptionIcon {icon} placeholder={iconPlaceholder} />
  {/if}
  <div class="option-title">
    <slot />
  </div>
  {#if showRadio}
    <Radio checked={selected} {name} {value} />
  {:else if showArrow}
    <span class="theme-highlight-color">&#xe604;</span>
  {/if}
</DeprecatedOption>

<style>
  span {
    display: inline-block;
    transform: rotate(180deg);
    position: absolute;
    right: 16px;
    top: 16px;
  }
</style>
