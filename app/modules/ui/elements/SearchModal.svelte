<script>
  /**
   * ARIA guidelines: https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.0pattern/combobox-autocomplete-list.html
   */

  // Svelte imports
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  // UI imports
  import Stack from 'ui/layouts/Stack.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import { getMiscIcon } from 'checkoutframe/icons';

  // Store imports
  import { overlayStack } from 'checkoutstore/back';

  // Utils imports
  import { isMobile } from 'common/useragent';
  import Track from 'tracker';
  import { isElementCompletelyVisibleInContainer } from 'lib/utils';

  // i18n
  import { locale } from 'svelte-i18n';
  import { formatTemplateWithLocale, formatMessageWithLocale } from 'i18n';

  // Props
  export let placeholder = 'Type to search';
  export let autocomplete = 'off';
  export let inputType = 'text';
  export let items = [];
  export let identifier = Track.makeUid();
  export let component;
  export let keys;
  export let all;

  const IDs = {
    overlay: `${identifier}_search_overlay`,
    resultItem: item => `${item._key}_search_result`,
    allItem: item => `${item._key}_search_all`,
  };

  onMount(() => {
    document.querySelector('#modal-inner').appendChild(containerRef);
  });

  const dispatch = createEventDispatcher();

  // Variables
  let visible = false;
  let query = '';
  let results = [];
  let shownItems = items;
  let focusedIndex = null;

  // Refs
  let containerRef;
  let inputRef;
  let resultsContainerRef;

  function updateResults() {
    if (query) {
      results = _Arr.filter(items, item => {
        const queryText = query.toLowerCase().trim();

        return _Arr.any(keys, key => {
          return item[key].toLowerCase().includes(queryText);
        });
      });
    } else {
      results = [];
    }

    if (results.length) {
      focusedIndex = 0;
    } else {
      focusedIndex = null;
    }
  }

  $: items, query, keys, updateResults();
  $: shownItems = _Arr.mergeWith(results, items);
  $: shownItems, focusedIndex, scrollToFocusedItem();

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

  export function open() {
    query = '';

    visible = true;

    // Wait for UI updates before focusing
    tick().then(focus);

    // Add to $overlayStack
    $overlayStack = $overlayStack.concat([
      {
        id: IDs.overlay,
        component: 'SearchModal',
        back: () => {
          dispatch('close');
        },
      },
    ]);
  }

  export function close() {
    visible = false;

    // Remove the overlay from $overlayStack
    const overlay = _Arr.find(
      $overlayStack,
      overlay => overlay.id === IDs.overlay
    );
    $overlayStack = _Arr.remove($overlayStack, overlay);
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
      dispatch('close');
    }
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
      if (!_.isNumber(focusedIndex)) {
        focusedIndex = shownItems.length - 1;
      } else if (focusedIndex === 0) {
        focusedIndex = shownItems.length - 1;
      } else {
        focusedIndex = focusedIndex - 1;
      }

      return;
    }

    if (key === DOWN_ARROW) {
      if (!_.isNumber(focusedIndex)) {
        focusedIndex = 0;
      } else if (focusedIndex === shownItems.length - 1) {
        focusedIndex = 0;
      } else {
        focusedIndex = focusedIndex + 1;
      }

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

  .search-box {
    font-size: 12px;
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
    font-size: 11px;
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

<div bind:this={containerRef}>
  {#if visible}
    <div class="search-curtain">
      <div
        class="search-curtain-bg"
        on:click={() => dispatch('close')}
        in:fade={{ duration: 200 }}
        out:fade={{ duration: 200 }} />
      <div
        class="search-box"
        in:fly={{ duration: 200, y: -100 }}
        out:fade={{ duration: 200 }}>
        <Stack vertical>
          <form on:submit|preventDefault={submitHandler} class="search-field">
            <div class="icon">
              <Icon icon={getMiscIcon('search')} />
            </div>
            <input
              class="no-escape"
              type="text"
              {autocomplete}
              {placeholder}
              on:focus={() => (inputRef.type = inputType)}
              on:keyup={escapeHandler}
              on:keydown={arrowKeysHandler}
              bind:value={query}
              bind:this={inputRef} />
          </form>
          <div
            class="search-results"
            bind:this={resultsContainerRef}
            class:has-query={query}>
            {#if query}
                {#if results.length}
                <!-- LABEL: Results -->
                <ul
                  class="list results"
                  aria-label={formatMessageWithLocale('misc.search_results_label', $locale)}>
                  {#each results as item, index (IDs.resultItem(item))}
                    <li
                      class="list-item"
                      class:focused={index === focusedIndex}
                      role="option"
                      aria-selected={index === focusedIndex}
                      on:click={() => onSelect(item)}>
                      <svelte:component this={component} {item} />
                    </li>
                  {/each}
                </ul>
                {:else}
                  <!-- LABEL: No results for "{query}" -->
                  <div class="no-results">
                    {formatTemplateWithLocale('misc.search_no_results', { query }, $locale)}
                  </div>
                {/if}
            {/if}
            {#if all}
              <div class="list-header">
                <div class="text">{all}</div>
                <div class="divider" />
              </div>
              <ul class="list" aria-label={all}>
                {#each items as item, index (IDs.allItem(item))}
                  <li
                    class="list-item"
                    class:focused={index + results.length === focusedIndex}
                    role="option"
                    aria-selected={index + results.length === focusedIndex}
                    on:click={() => onSelect(item)}>
                    <svelte:component this={component} {item} />
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </Stack>
      </div>
    </div>
  {/if}
</div>
