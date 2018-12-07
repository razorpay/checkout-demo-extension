<div class="option-icon">
  {#if /^<svg/.test(icon)}
    {@html icon}
  {:elseif /^\&.*\;$/.test(icon)}
    <i class="theme">{@html icon}</i>
  {:elseif /^\./.test(icon)}
    <div class={icon.split('.').join(' ')}></div>
  {:else}
    <img src="{icon}">
  {/if}
</div>