<script>
  // Svelte imports
  import { onMount } from 'svelte';

  export let align;
  export let parentElem;
  export let snackbar;
  export let shown;
  export let timer;
  export let text;

  function setAlignmentClass() {
    snackbar.classList.add(`snackbar-${align}`);
  }

  function getPosition() {
    const top = document.getElementById(parentElem).offsetTop;
    const left = document.getElementById(parentElem).offsetLeft;
    snackbar.style.top = `${top + 42}px`;
  }

  $: {
    if (shown) {
      setTimeout(() => {
        setAlignmentClass();
        getPosition();
        setTimeout(() => {
          shown = false;
        }, timer);
      });
    }
  }
</script>

<style>
  .snackbar {
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
    right: 10px;
    pointer-events: none;
    top: -54px;
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

{#if shown}
  <div class="snackbar" bind:this={snackbar}>{text}</div>
{/if}
