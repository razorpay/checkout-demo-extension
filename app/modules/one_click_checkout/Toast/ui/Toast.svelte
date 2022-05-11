<script>
  import { fly } from 'svelte/transition';

  export let shown;
  let msg;
  let theme;

  export function show(options) {
    const { delay = 5000, message, theme: selectedTheme } = options || {};
    msg = message;
    shown = true;
    theme = selectedTheme;
    if (delay) {
      setTimeout(() => {
        shown = false;
      }, delay);
    }
  }

  export function isVisible() {
    return shown;
  }

  export function hide() {
    shown = false;
  }
</script>

{#if shown}
  <div
    data-test-id="toast-{theme}"
    class={`toast-wrapper ${theme || ''}`}
    transition:fly|local={{ y: 30, duration: 800 }}
  >
    {msg}
  </div>
{/if}

<style>
  .toast-wrapper {
    font-size: 13px;
    padding: 12px 24px;
    color: #79747e;
    position: absolute;
    bottom: 0;
    z-index: 1;
    width: 100%;
    box-sizing: border-box;
  }

  .success {
    background-color: #e5f6ea;
    border-top: 2px solid #b9dfc2;
  }

  .error {
    background-color: #fae8e3;
    border-top: 2px solid #e7bbb4;
  }

  .info {
    background-color: #e4f9ff;
    border-top: 2px solid #b9d7df;
  }
</style>
