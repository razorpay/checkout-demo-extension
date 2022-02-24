<script context="module">
  export const MENU_PLACEMENT = {
    right: 'right',
    left: 'left',
  };
</script>

<script>
  import { onMount, onDestroy, tick, createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';

  export let open = false;
  export let placement = MENU_PLACEMENT.right;
  export let closeOnOutsideClick = true;
  export let classes = '';
  export let menuClasses = '';
  export let triggerElement;

  const dispatch = createEventDispatcher();

  let menuItem;
  let outsideClickEvent;
  let triggerEvent;

  $: {
    if (open) {
      onDropdownOpened();
    } else {
      onDropdownClosed();
    }
  }

  function attachEvent(target, ...args) {
    target.addEventListener(...args);
    return {
      remove: () => target.removeEventListener(...args),
    };
  }

  function onDropdownOpened() {
    // outside Event listener
    if (closeOnOutsideClick) {
      outsideClickEvent = attachEvent(document, 'click', (event) => {
        if (event.target !== menuItem && !menuItem.contains(event.target)) {
          open = false;
        }
      });
    }
  }

  function onDropdownClosed() {
    if (outsideClickEvent) {
      outsideClickEvent.remove();
    }
  }

  onMount(() => {
    tick().then(() => {
      triggerEvent = attachEvent(triggerElement, 'click', (event) => {
        event.stopPropagation();
        event.preventDefault();
        dispatch('click');
        open = !open;
      });
    });
  });

  onDestroy(() => {
    onDropdownClosed();
    triggerEvent.remove();
  });
</script>

<div class={`dropdown-container ${classes}`}>
  <slot />

  {#if open}
    <div
      class="dropdown-menu-{placement}  dropdown-menu {menuClasses}"
      bind:this={menuItem}
      transition:slide|local={{ duration: 100 }}
    >
      <slot name="DropdownMenu" />
    </div>
  {/if}
</div>

<style>
  .dropdown-container {
    position: relative;
    display: inline-block;
  }

  .dropdown-menu {
    position: absolute;
    box-shadow: 0px 4px 5px 0px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    z-index: 1;
    border-radius: 4px;
  }

  .dropdown-menu-right {
    right: 8px;
  }

  .dropdown-menu-left {
    left: 8px;
  }
</style>
