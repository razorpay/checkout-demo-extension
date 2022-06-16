<script>
  export let align;
  export let snackbar;
  export let shown;
  export let timer;
  export let text; // pass an array of strings for the clubbed version of the snackbar
  export { className as class };

  let className = '';
  let timeout;

  function setAlignmentClass() {
    if (snackbar) {
      snackbar.classList.add(`snackbar-${align}`);
    }
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
  <div
    class={`snackbar ${className}`}
    class:single-text-pd={!Array.isArray(text)}
    class:multi-text-pd={Array.isArray(text)}
    bind:this={snackbar}
  >
    {#if Array.isArray(text)}
      {#each text as message, i}
        <div class="multi-message">
          {message}
        </div>
        {#if i !== text.length - 1}
          <hr />
        {/if}
      {/each}
    {:else}
      {text}
    {/if}
  </div>
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
    background-color: rgb(81, 84, 97);
    opacity: 1;
    -webkit-border-radius: 3px;
    border-radius: 3px;
    color: #fff;
    padding: 8px 12px;
    pointer-events: none;
    box-shadow: 0px 4px 4px 0px #0000001a;
    right: -5px;
  }

  .multi-message {
    width: 100%;
    padding: 8px 12px;
    text-align: center;
    margin-left: -12px;
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

  .snackbar-cod {
    top: initial;
    bottom: 0;
    width: 300px;
    text-align: center;
    margin-bottom: 12px;
    font-size: 11px;
    /* the below styles align the snackbar in the center */
    left: 50%;
    transform: translateX(-50%);
  }

  .snackbar-cod::before {
    content: '';
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-bottom: none;
    border-top: none;
    border-right: none;
  }

  .single-text-pd {
    padding: 12px;
  }

  .multi-text-pd {
    padding: 4px 12px;
  }

  hr {
    border: 1px solid #ffffff;
    border-bottom-width: 0;
    opacity: 0.2;
  }
</style>
