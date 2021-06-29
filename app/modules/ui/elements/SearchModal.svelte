<script>
  /**
   * ARIA guidelines: https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.0pattern/combobox-autocomplete-list.html
   */

  // Svelte imports
  import { createEventDispatcher, onMount, tick, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { showCta, hideCta } from 'checkoutstore/cta';

  // UI imports
  import Stack from 'ui/layouts/Stack.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import { getMiscIcon } from 'checkoutframe/icons';
  import CTA from 'ui/elements/CTA.svelte';

  // Store imports
  import { overlayStack } from 'checkoutstore/back';

  // Utils imports
  import { isMobile } from 'common/useragent';
  import { Track } from 'analytics';
  import { isElementCompletelyVisibleInContainer } from 'lib/utils';
  import * as Search from 'checkoutframe/search';
  import { getAnimationOptions } from 'svelte-utils';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  // Props
  export let placeholder = 'Type to search';
  export let autocomplete = 'off';
  export let inputType = 'text';
  export let items = [];
  export let identifier = Track.makeUid();
  export let component;
  export let keys;
  export let all;
  export let open = false;

  const IDs = {
    overlay: `${identifier}_search_overlay`,
    results: `${identifier}_search_results`,
    resultItem: item => `${identifier}_${item._key}_search_result`,
    allItem: item => `${identifier}_${item._key}_search_all`,
  };

  onMount(() => {
    document.querySelector('#modal-inner').appendChild(containerRef);
  });

  const dispatch = createEventDispatcher();

  // Variables for searching library
  const cache = Search.createCache();

  // Variables
  let query = '';
  let results = [];
  let shownItems = items;
  let focusedIndex = null;
  let activeDescendantIdRef;

  // Refs
  let containerRef;
  let inputRef;
  let resultsContainerRef;

  function getResults(query, items) {
    if (query) {
      const queryText = query.toLowerCase().trim();

      const { results } = Search.search(queryText, items, keys, {
        cache,
        algorithm: Search.algorithmWithTypo,
        threshold: -100,
      });

      return _Arr.map(results, result => result.ref);
    } else {
      return [];
    }
  }

  $: items, query, keys, (results = getResults(query, items));
  $: results, (focusedIndex = results.length ? 0 : null);
  $: shownItems = _Arr.mergeWith(results, items);
  $: shownItems, focusedIndex, scrollToFocusedItem();
  $: shownItems, focusedIndex, updateActiveDescendantInRef(); // TODO: Fix

  function updateActiveDescendantInRef() {
    tick().then(() => {
      activeDescendantIdRef = getActiveDescendantIdRef(focusedIndex);
    });
  }

  function getActiveDescendantIdRef(index) {
    if (!_.isNumber(index)) {
      return;
    }

    if (index < results.length) {
      return `#${IDs.resultItem(results[index])}`;
    } else {
      index = index - results.length;
      return `#${IDs.allItem(items[index])}`;
    }
  }

  function bringItemAtIndexIntoView(index) {
    if (!resultsContainerRef) {
      return;
    }

    const selector = `.list-item:nth-of-type(${index + 1})`;
    const item = resultsContainerRef.querySelector(selector);

    if (item) {
      if (!isElementCompletelyVisibleInContainer(item, resultsContainerRef)) {
        /**
         * setTimeout is needed because UI changes need to be completed.
         * tick() doesn't work here.
         */
        setTimeout(() => {
          try {
            item.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'center',
            });
          } catch (err) {}
        });
      }
    }
  }

  function scrollToFocusedItem() {
    // If focusedIndex is not a number, don't go ahead
    if (!_.isNumber(focusedIndex)) {
      return;
    }

    tick().then(() => {
      bringItemAtIndexIntoView(focusedIndex);
    });
  }

  function dispatchClose(meta) {
    // Consumer can figure out whether or not to actually close
    // by looking at `event.detail.meta.from`
    dispatch('close', { meta });
  }

  function onSelect(item) {
    dispatch('select', item);
  }

  function focus() {
    if (!inputRef) {
      return;
    }

    /**
     * Focus on input field on Desktop.
     * Handle focus on the parent on mobile.
     */
    if (isMobile()) {
      const parent = _El.parent(inputRef);

      if (parent) {
        parent.focus();
      }
    } else {
      inputRef.focus();
    }
  }

  function removeFromOverlayStack() {
    // Remove the overlay from $overlayStack
    const overlay = $overlayStack.find(overlay => overlay.id === IDs.overlay);
    $overlayStack = _Arr.remove($overlayStack, overlay);
  }

  onDestroy(() => {
    removeFromOverlayStack();
    cache.clear();
  });

  function openWithOverlay() {
    query = '';
    // Wait for UI updates before focusing
    tick().then(focus);

    // Add to $overlayStack
    $overlayStack = $overlayStack.concat([
      {
        id: IDs.overlay,
        component: 'SearchModal',
        back: meta => {
          dispatchClose(meta);
        },
      },
    ]);
  }

  $: {
    if (open) {
      openWithOverlay();
      hideCta();
    } else {
      removeFromOverlayStack();
      if(open === false) {
        showCta();
      }
    }
  }

  function escapeHandler(event) {
    if (_.getKeyFromEvent(event) === 27) {
      // Don't close Checkout!
      event.stopPropagation();
      event.preventDefault();

      /**
       * ARIA guidelines suggest
       * - Clear the textbox.
       * - If the listbox is displayed, close it.
       */
      if (query) {
        query = '';
      } else {
        dispatchClose({
          from: 'escape',
        });
      }
    }
  }

  function getNextIndexForUpKey(items, currentIndex) {
    if (!_.isNumber(currentIndex)) {
      return items.length - 1;
    } else if (currentIndex === 0) {
      return items.length - 1;
    } else {
      return currentIndex - 1;
    }
  }

  function getNextIndexForDownKey(items, currentIndex) {
    if (!_.isNumber(currentIndex)) {
      return 0;
    } else if (currentIndex === items.length - 1) {
      return 0;
    } else {
      return focusedIndex + 1;
    }
  }

  function arrowKeysHandler(event) {
    const UP_ARROW = 38;
    const DOWN_ARROW = 40;

    const handleKeys = [UP_ARROW, DOWN_ARROW];

    const key = _.getKeyFromEvent(event);

    if (!_Arr.contains(handleKeys, key)) {
      return;
    }

    if (key === UP_ARROW) {
      focusedIndex = getNextIndexForUpKey(shownItems, focusedIndex);
      return;
    }

    if (key === DOWN_ARROW) {
      focusedIndex = getNextIndexForDownKey(shownItems, focusedIndex);
      return;
    }
  }

  function submitHandler() {
    if (_.isNumber(focusedIndex)) {
      const result = shownItems[focusedIndex];

      onSelect(result);
    }
  }
</script>

<div bind:this={containerRef}>
  {#if open}
    <div class="search-curtain">
      <div
        class="search-curtain-bg"
        on:click={() => dispatchClose({ from: 'overlay' })}
        in:fade={getAnimationOptions({ duration: 200 })}
        out:fade={getAnimationOptions({ duration: 200 })}
      />
      <div
        class="search-box"
        in:fly={getAnimationOptions({ duration: 200, y: -100 })}
        out:fade={getAnimationOptions({ duration: 200 })}
      >
        <Stack vertical>
          <form on:submit|preventDefault={submitHandler} class="search-field">
            <div class="icon">
              <Icon icon={getMiscIcon('search')} />
            </div>
            <input
              class="no-escape"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-haspopup="true"
              aria-owns={`#${IDs.results}`}
              aria-expanded="true"
              aria-activedescendant={activeDescendantIdRef}
              {autocomplete}
              {placeholder}
              on:focus={() => (inputRef.type = inputType)}
              on:keyup={escapeHandler}
              on:keydown={arrowKeysHandler}
              bind:value={query}
              bind:this={inputRef}
            />
          </form>
          <div
            class="search-results"
            class:has-query={query}
            id={IDs.results}
            aria-label={$t('misc.search_results_label')}
            role="listbox"
            bind:this={resultsContainerRef}
          >
            {#if query}
              {#if results.length}
                <!-- LABEL: Results -->
                <div class="list results">
                  {#each results as item, index (IDs.resultItem(item))}
                    <div
                      class="list-item"
                      class:focused={index === focusedIndex}
                      id={IDs.resultItem(item)}
                      role="option"
                      aria-selected={index === focusedIndex}
                      on:click={() => onSelect(item)}
                    >
                      <svelte:component this={component} {item} />
                    </div>
                  {/each}
                </div>
              {:else}
                <!-- LABEL: No results for "{query}" -->
                <div class="no-results">
                  {formatTemplateWithLocale(
                    'misc.search_no_results',
                    { query },
                    $locale
                  )}
                </div>
              {/if}
            {/if}
            {#if all}
              <div class="list-header">
                <div class="text">{all}</div>
                <div class="divider" />
              </div>
              <div class="list">
                {#each items as item, index (IDs.allItem(item))}
                  <div
                    class="list-item"
                    class:focused={index + results.length === focusedIndex}
                    id={IDs.allItem(item)}
                    role="option"
                    aria-selected={index + results.length === focusedIndex}
                    on:click={() => onSelect(item)}
                  >
                    <svelte:component this={component} {item} />
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </Stack>
      </div>
    </div>
  {/if}
</div>

<style>
  .search-curtain {
    justify-content: center;
    align-items: center;
    position: absolute;
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

  .search-curtain {
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

  .search-box > :global(.stack) {
    height: 100%;
  }

  .search-results {
    flex-grow: 1;
    overflow: auto;
  }

  .list-header {
    display: flex;
    align-items: center;
    font-size: 0.8rem;
    line-height: 13px;
    margin-top: 16px;
    margin-bottom: 4px;

    color: rgba(117, 117, 117, 0.58);
  }

  .has-query .list-header {
    margin-top: 4px;
  }

  .list-header .text {
    margin-left: 14px;
    margin-right: 8px;
  }

  .list-header .divider {
    background-color: #eeeeee;
    height: 1px;
    border-top-left-radius: 1px;
    border-bottom-left-radius: 1px;
    flex-grow: 1;
    margin-top: 2px;
  }

  .search-field {
    display: flex;
    flex-shrink: 0;
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
    font-size: 1rem;
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
    padding: 0;
  }

  .list-item {
    display: flex;
    justify-content: space-between;
    padding: 14px;
    border-bottom: 1px solid #eeeeee;
    color: #424242;
    cursor: pointer;
  }

  .has-query .list.results .list-item:last-child {
    border-bottom: none;
  }

  .list-item:hover {
    background-color: #efefef;
  }

  .list-item.focused {
    background-color: #e4e4e4;
  }

  .no-results {
    display: flex;
    justify-content: center;
    text-align: center;
    padding: 20px 24px;
    color: #888;
  }
</style>
