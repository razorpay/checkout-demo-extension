<script lang="ts">
  import { t } from 'svelte-i18n';
  import { slide } from 'svelte/transition';
  import { getAnimationOptions } from 'svelte-utils';
  import { SECURED_BY_MESSAGE } from 'ui/labels/home';

  export let className = '';
</script>

<div
  class={`secured-message ${className}`.trim()}
  id="secured-message"
  out:slide={getAnimationOptions({ duration: 100 })}
>
  <i>
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12 5.33335H11.3333V4.00002C11.3333 2.16002 9.83999 0.666687
        7.99999 0.666687C6.15999 0.666687 4.66666 2.16002 4.66666
        4.00002V5.33335H3.99999C3.26666 5.33335 2.66666 5.93335 2.66666
        6.66669V13.3334C2.66666 14.0667 3.26666 14.6667 3.99999
        14.6667H12C12.7333 14.6667 13.3333 14.0667 13.3333
        13.3334V6.66669C13.3333 5.93335 12.7333 5.33335 12
        5.33335ZM7.99999 11.3334C7.26666 11.3334 6.66666 10.7334 6.66666
        10C6.66666 9.26669 7.26666 8.66669 7.99999 8.66669C8.73332
        8.66669 9.33332 9.26669 9.33332 10C9.33332 10.7334 8.73332
        11.3334 7.99999 11.3334ZM6 4V5.33334H10V4C10 2.89334 9.10666 2 8
        2C6.89333 2 6 2.89334 6 4Z"
        fill="#A7A7A7"
      />
    </svg>
  </i>
  <!-- LABEL: This payment is secured by Razorpay. -->
  {$t(SECURED_BY_MESSAGE)}
</div>

<style>
  .secured-message {
    display: flex;
    align-items: center;
    padding: 12px 0;
    font-size: 13px;
    color: rgba(51, 51, 51, 0.6);
    justify-content: center;
  }
</style>
