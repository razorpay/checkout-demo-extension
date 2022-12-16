<script lang="ts">
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
    data-testid="toast-{theme}"
    class={`toast-wrapper ${theme || ''}`}
    transition:fly|local={{ y: 30, duration: 500 }}
  >
    {msg}
  </div>
{/if}

<style>
  .toast-wrapper {
    font-size: 13px;
    padding: 12px 24px;
    color: var(--primary-text-color);
    position: absolute;
    bottom: 0;
    z-index: 1;
    width: 100%;
    box-sizing: border-box;
  }

  .success {
    background-color: #e2faef;
    box-shadow: inset 0px 2px 0px #a3eac9;
  }

  .error {
    background-color: #fff4f6;
    box-shadow: inset 0px 2px 0px #e19f94;
  }

  .info {
    background-color: #e1eaf9;
    box-shadow: inset 0px 2px 0px #a6c5ed;
  }
</style>
