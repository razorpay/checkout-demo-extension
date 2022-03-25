<script>
  import { isOneClickCheckout } from 'razorpay';

  export let type = 'button';
  export let disabled = false;

  const isOneCC = isOneClickCheckout();
</script>

<button
  {type}
  {...$$props}
  on:click
  class={isOneCC ? 'one-cc-btn theme theme-border' : 'button hc_border'}
  {disabled}
>
  <slot />
</button>

<style>
  .button {
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
