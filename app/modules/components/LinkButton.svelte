<script lang="ts">
  import { isRedesignV15 } from 'razorpay';

  export let type = 'button';
  export let disabled = false;

  const isRedesignV15Enabled = isRedesignV15();
</script>

<button
  {type}
  {...$$props}
  on:click
  class={isRedesignV15Enabled
    ? 'one-cc-btn theme theme-border'
    : 'standard-btn hc_border'}
  {disabled}
>
  <slot />
</button>

<style>
  .standard-btn {
    padding: 3px 1px;
    font-size: 12px;
    border-bottom: 1px solid;
  }

  .one-cc-btn {
    padding: 2px 1px;
    font-size: 16px;
    font-weight: 500;
    border-bottom: 1px solid;
  }
  button:disabled {
    color: #ccc;
    cursor: default;
  }
</style>
