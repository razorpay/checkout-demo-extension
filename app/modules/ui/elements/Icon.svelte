<script>
  // Svelte imports
  import { onMount } from 'svelte';

  // Props
  export let icon;
  export let placeholder = '';
  export let loaded = true;
  export let alt = '';

  // Computed
  export let loadableIcon = false;
  export let iconToUse = undefined;

  onMount(() => {
    if (loadableIcon) {
      loaded = false;
    }
  });

  function loader(node) {
    node.onload = () => {
      loaded = true;
    };
  }

  $: loadableIcon = /^http/.test(icon);
  $: {
    if (loaded) {
      iconToUse = icon || placeholder;
    } else if (icon) {
      iconToUse = placeholder ? placeholder : icon;
    } else if (placeholder) {
      iconToUse = placeholder;
    } else {
      iconToUse = icon;
    }
  }
</script>

{#if loadableIcon && !loaded}
  <img src={icon} style="display: none;" {alt} use:loader />
{/if}

{#if /^<svg/.test(iconToUse)}
  {@html iconToUse}
{:else if /^&.*;$/.test(iconToUse)}
  <i class="theme">
    {@html iconToUse}
  </i>
{:else if /^\./.test(iconToUse)}
  <div class={iconToUse.split('.').join(' ')} />
{:else if /^<i .*\/>$/.test(iconToUse)}
  {@html iconToUse}
{:else}
  <img src={iconToUse} {alt} />
{/if}
