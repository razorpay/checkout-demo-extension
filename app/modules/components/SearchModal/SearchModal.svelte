<script lang="ts">
  /**
   * ARIA guidelines: https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.0pattern/combobox-autocomplete-list.html
   */

  // Svelte imports
  import { tick, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  // UI imports
  import Stack from 'ui/layouts/Stack.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import { getMiscIcon } from 'checkoutframe/icons';
  import { isOneClickCheckout } from 'razorpay';

  // Utils imports
  import { Track } from 'analytics';
  import { isElementCompletelyVisibleInContainer, returnAsIs } from 'lib/utils';
  import * as Search from 'checkoutframe/search';
  import { getAnimationOptions } from 'svelte-utils';

  // i18n
  import { t, locale } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  import { popStack } from 'navstack';

  // Props
  export let placeholder = 'Type to search';
  export let sortSearchResult: any;
  export let autocomplete = 'off';
  export let inputType = 'text';
  export let items: any[] = [];
  export let identifier = Track.makeUid();
  export let component: any;
  export let keys: string[];
  export let all: string;
  export let onSelect = returnAsIs;
  export let onClose = returnAsIs;

  const IDs = {
    overlay: `${identifier}_search_overlay`,
    results: `${identifier}_search_results`,
    resultItem: (item: any, index: number) =>
      `${identifier}_${item._key}_${index}_search_result`,
    allItem: (item: any, index: number) =>
      `${identifier}_${item._key}_${index}_search_all`,
  };

  // Variables for searching library
  const cache = Search.createCache();

  // Variables
  let query = '';
  let results: any[] = [];
  let shownItems = items;
  let focusedIndex: number | null = null;
  let activeDescendantIdRef: string;

  // Refs
  let inputRef;
  let resultsContainerRef;

  const isOneClickCheckoutEnabled = isOneClickCheckout();

  function getResults(query, items) {
    if (query) {
      const queryText = query.toLowerCase().trim();

      const { results } = Search.search(queryText, items, keys, {
        cache,
        algorithm: Search.algorithmWithTypo,
        threshold: -100,
      });

      const finalResult = results.map((result) => result.ref);
      if (typeof sortSearchResult === 'function') {
        finalResult.sort(sortSearchResult);
      }
      return finalResult;
    } else {
      return [];
    }
  }

  $: items, query, keys, (results = getResults(query, items));
  $: results, (focusedIndex = results.length ? 0 : null);
  $: shownItems = results.concat(items);
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
      return `#${IDs.resultItem(results[index], index)}`;
    } else {
      index = index - results.length;
      return `#${IDs.allItem(items[index], index)}`;
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

  function dispatchClose(meta, destroyed) {
    // Consumer can figure out whether or not to actually close
    // by looking at `event.detail.meta.from`
    if (!destroyed) {
      popStack();
    }
    if (onClose) {
      onClose({ meta });
    }
  }

  onDestroy(() => {
    dispatchClose({}, true);
    cache.clear();
  });

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

    if (!handleKeys.includes(key)) {
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

  function onSelectHandler(result) {
    if (onSelect) {
      onSelect(result);
    }
    popStack();
  }

  function submitHandler() {
    if (_.isNumber(focusedIndex)) {
      const result = shownItems[focusedIndex];
      onSelectHandler(result);
    }
  }
</script>

<div
  class="search-box"
  in:fly={getAnimationOptions({ duration: 200, y: -100 })}
  out:fade={getAnimationOptions({ duration: 200 })}
>
  <Stack vertical>
    <form
      on:submit|preventDefault={submitHandler}
      class="search-field"
      class:search-field-1cc={isOneClickCheckoutEnabled}
    >
      <div class="icon">
        <Icon
          icon={isOneClickCheckoutEnabled
            ? getMiscIcon('search_one_cc')
            : getMiscIcon('search')}
        />
      </div>
      <input
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="true"
        aria-owns={`#${IDs.results}`}
        aria-expanded="true"
        aria-activedescendant={activeDescendantIdRef}
        {autocomplete}
        placeholder={$t(placeholder)}
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
      class:search-dropdown-1cc={isOneClickCheckoutEnabled}
    >
      {#if query}
        {#if results.length}
          <!-- LABEL: Results -->
          <div class="list results">
            {#each results as item, index (IDs.resultItem(item, index))}
              <div
                class="list-item"
                class:list-item-1cc={isOneClickCheckoutEnabled}
                class:focused={index === focusedIndex}
                id={IDs.resultItem(item, index)}
                role="option"
                aria-selected={index === focusedIndex}
                on:click={() => onSelectHandler(item)}
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
        {#if isOneClickCheckoutEnabled}
          <div class="list-header list-header-1cc">
            <div class="divider" />
            <div class="text">{$t(all)}</div>
          </div>
        {:else}
          <div class="list-header">
            <div class="text">{$t(all)}</div>
            <div class="divider" />
          </div>
        {/if}
      {/if}
      <div class="list">
        {#each items as item, index (IDs.allItem(item, index))}
          <div
            class="list-item"
            class:focused={index + results.length === focusedIndex}
            class:list-item-1cc={isOneClickCheckoutEnabled}
            id={IDs.allItem(item, index)}
            role="option"
            aria-selected={index + results.length === focusedIndex}
            on:click={() => onSelectHandler(item)}
          >
            <svelte:component this={component} {item} />
          </div>
        {/each}
      </div>
    </div>
  </Stack>
</div>
<!-- </div> -->

<!-- </div> -->
<style>
  .search-box {
    position: relative;
    background-color: white;
    width: 100%;
    height: 100%;
    width: 90% !important;
    height: 90%;
    top: 5%;
    left: 5%;
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
    text-align: left;
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

  .list-item-1cc {
    border-bottom: none;
    color: #263a4a;
  }

  .list-header-1cc {
    flex-direction: column;
    margin-top: 0px;
  }

  .list-header-1cc .text {
    width: 100%;
    padding: 16px 16px 0px 16px;
    box-sizing: border-box;
    margin: 0px;
    font-size: 14px;
    line-height: 16px;
    color: #757575;
  }

  .list-header-1cc .divider {
    width: 100%;
  }

  .search-field-1cc {
    box-shadow: none;
    border: 1px solid #e0e0e0;
    box-sizing: border-box;
    border-radius: 4px;
    align-self: stretch;
    margin: 20px 16px;
  }

  .search-field-1cc .icon :global(svg) {
    width: 14px;
    height: 14px;
  }

  .search-field-1cc .icon {
    margin-right: -6px;
  }
</style>
