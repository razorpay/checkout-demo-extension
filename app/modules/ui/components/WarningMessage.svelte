<script>
  import { fly } from 'svelte/transition';

  export let message = '';
  export let show = false;
</script>

{#if show}
  <div class="warning-message" transition:fly={{ duration: 200 }}>
    {message}
  </div>
{/if}

<style>
  .warning-message {
    margin: 20px 18px 14px;
    padding: 8px 14px;
    background: rgba(205, 130, 20, 0.1);
    border-radius: 2px;
    color: #cd8214;
    font-weight: 500;
    font-size: 12px;
  }
</style>
