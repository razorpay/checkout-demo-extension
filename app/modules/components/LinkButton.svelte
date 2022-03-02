<script>
  import { isOneClickCheckout } from 'razorpay';

  export let type = 'button';
  export let disabled = false;
</script>

<button
  {type}
  {...$$props}
  on:click
  class="hc_border"
  class:theme={isOneClickCheckout()}
  class:colored-btn={isOneClickCheckout()}
  {disabled}
>
  <slot />
</button>

<style>
  button {
    padding: 3px 1px;
    font-size: 12px;
    border-bottom: 1px solid;
  }

  .colored-btn {
    padding: 2px 1px;
    font-size: 16px;
    font-weight: 500;
  }
  button:disabled {
    color: #ccc;
    cursor: default;
  }
</style>
