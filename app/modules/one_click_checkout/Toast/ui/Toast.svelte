<script>
  export let shown;
  let msg;
  let theme;

  export function show(options) {
    const { delay, message, theme: selectedTheme } = options || {};
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
  <div class={`toast-wrapper ${theme || ''}`}>
    {msg}
  </div>
{/if}

<style>
  .toast-wrapper {
    font-size: 13px;
    padding: 12px 24px;
    color: #79747e;
  }

  .success {
    background-color: #e5f6ea;
    border-top: 2px solid #b9dfc2;
  }

  .error {
    background-color: #fae8e3;
    border-top: 2px solid #e7bbb4;
  }
</style>
