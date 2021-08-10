<script>
  export let align;
  export let snackbar;
  export let shown;
  export let timer;
  export let text;
  let timeout;

  function setAlignmentClass() {
    snackbar.classList.add(`snackbar-${align}`);
  }

  export function removeSnackBar() {
    shown = false;
    clearTimeout(timeout);
  }

  $: {
    if (shown) {
      setTimeout(() => {
        setAlignmentClass();
        timeout = setTimeout(() => {
          shown = false;
        }, timer);
      });
    }
  }
</script>

{#if shown}
  <div class="snackbar" bind:this={snackbar}>{text}</div>
{/if}

<style>
  .snackbar {
    top: 42px;
    z-index: 1;
    -webkit-transition: opacity 0.15s ease-in;
    -o-transition: opacity 0.15s ease-in;
    transition: opacity 0.15s ease-in;
    display: block;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.8);
    -webkit-border-radius: 3px;
    border-radius: 3px;
    color: #fff;
    padding: 8px 12px;
    right: -5px;
    pointer-events: none;
  }
  .snackbar::before {
    content: '';
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-bottom: 6px solid transparent;
    border-top: 6px solid transparent;
    border-right: 6px solid rgba(0, 0, 0, 0.8);
  }
  :global(.snackbar-bottom::before) {
    transform: translateY(-50%) rotate(90deg);
    top: -3px;
    right: 26px;
  }
</style>
