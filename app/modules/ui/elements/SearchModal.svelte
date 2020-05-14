<script>
  // Svelte imports
  import { createEventDispatcher, onMount, tick } from 'svelte';

  // UI imports
  import Stack from 'ui/layouts/Stack.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import { getMiscIcon } from 'checkoutframe/icons';

  // Utils imports
  import { isMobile } from 'common/useragent';

  // Props
  export let placeholder = 'Type to search';
  export let autocomplete;
  export let items = [];
  export let component;
  export let keys;

  onMount(() => {
    document.querySelector('#modal-inner').appendChild(ref);
  });

  const dispatch = createEventDispatcher();

  // Variables
  let visible = false;
  let ref;
  let query = '';
  let matchingItems = items;

  // Refs
  let inputField;

  function updateMatches() {
    matchingItems = _Arr.filter(items, item => {
      const queryText = query.toLowerCase().trim();

      return _Arr.any(keys, key => {
        return item[key].toLowerCase().includes(queryText);
      });
    });
  }

  $: query, updateMatches();

  function onSelect(item) {
    dispatch('select', item);
  }

  function focus() {
    if (!inputField) {
      return;
    }

    /**
     * Focus on input field on Desktop.
     * Handle focus on the parent on mobile.
     */
    if (isMobile()) {
      const parent = _El.parent(inputField);

      if (parent) {
        parent.focus();
      }
    } else {
      inputField.focus();
    }
  }

  export function open() {
    visible = true;

    // Wait for UI updates before focusing
    tick().then(focus);
  }

  export function close() {
    visible = false;
  }
</script>

<style>
  .search-curtain {
    justify-content: center;
    align-items: center;
    position: fixed;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    text-align: left;
    font-family: 'lato', ubuntu, helvetica, sans-serif;
  }

  .search-curtain-bg {
    background-color: rgba(0, 0, 0, 0.5);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .search-curtain:not(.shown) {
    display: none;
    pointer-events: none;
    z-index: 0;
  }

  .search-curtain.shown {
    display: flex;
    z-index: 3;
  }

  .search-box {
    position: relative;
    background-color: white;
    width: 100%;
    height: 100%;
    width: 90%;
    height: 90%;
  }

  .search-box {
    box-sizing: border-box;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .search-field {
    display: flex;
    align-items: center;
    box-shadow: 0px 6px 4px rgba(196, 196, 196, 0.2);
  }

  .search-field > * {
    height: 48px;
  }

  .search-field .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 0;
    height: 48px;
    width: 48px + 8px;
  }

  .search-field .icon :global(svg) {
    width: 20px;
    height: 20px;
  }

  .search-field input {
    color: #888;
    width: 100%;
    font-size: 13px;
  }

  .search-field input::placeholder {
    color: #888;
  }

  .list {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    overflow-y: auto;
    margin: 0;
  }

  .list-item {
    display: flex;
    justify-content: space-between;
    padding: 14px;
    border-bottom: 1px solid #ddd;
    color: #888;
    cursor: pointer;
  }

  .list-item:hover {
    background-color: #eff0f1;
  }

  .no-results {
    display: flex;
    justify-content: center;
    text-align: center;
    padding: 24px;
    color: #888;
  }
</style>

<div class="search-curtain" class:shown={visible} bind:this={ref}>
  <div class="search-curtain-bg" on:click={close} />
  <div class="search-box">
    <div class="search-field">
      <div class="icon">
        <Icon icon={getMiscIcon('search')} />
      </div>
      <input
        type="text"
        {autocomplete}
        {placeholder}
        bind:value={query}
        bind:this={inputField} />
    </div>
    <div class="list">
      {#if matchingItems.length}
        {#each matchingItems as item}
          <div class="list-item" on:click={() => onSelect(item)}>
            <svelte:component this={component} {item} />
          </div>
        {/each}
      {:else}
        <div class="no-results">No results for "{query}"</div>
      {/if}
    </div>
  </div>
</div>
