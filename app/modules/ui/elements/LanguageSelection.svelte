<script>
  import { locale, locales, isLoading } from 'svelte-i18n';
  import { getLocaleName } from 'i18n/init';
  import { onMount, onDestroy } from 'svelte';
  import { shouldUseVernacular } from 'checkoutstore/methods';
  import * as _El from 'utils/DOM';
  import { querySelector } from 'utils/doc';

  const overlayEl = querySelector('#body-overlay');

  const shouldShowDropdown = shouldUseVernacular();

  function handleOutsideClick() {
    if (dropdownShown) {
      dropdownShown = false;
    }
  }

  $: {
    if (dropdownShown) {
      document.body.addEventListener('click', handleOutsideClick);
    } else {
      document.body.removeEventListener('click', handleOutsideClick);
    }
  }

  $: {
    _El.keepClass(overlayEl, 'shown', dropdownShown);
  }

  let dropdownShown = false;

  function toggleDropdown() {
    dropdownShown = !dropdownShown;
  }

  function select(code) {
    $locale = code;
    dropdownShown = false;
  }

  const header = querySelector('#header');

  // Since it occupies the bottom of header, we need to remove header's padding
  onMount(() => {
    if (shouldShowDropdown) {
      _El.addClass(header, 'has-dropdown');
    }
  });

  onDestroy(() => {
    _El.removeClass(header, 'has-dropdown');
  });
</script>

{#if shouldShowDropdown}
  <div class="outer">
    <div class="selected" on:click|stopPropagation={toggleDropdown}>
      {getLocaleName($locale)}
    </div>
    {#if dropdownShown}
      <ul class="dropdown-options">
        {#each $locales as locale}
          <li on:click={() => select(locale)}>{getLocaleName(locale)}</li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}

<style>
  .outer {
    margin: 0 -24px;
    padding: 6px 24px;
    height: 20px;
    background: rgba(0, 0, 0, 0.1);
    clear: both;
  }

  .selected {
    position: relative;
    width: 56px;
    padding-right: 14px;
    cursor: pointer;
  }

  .selected::after {
    content: '';
    font-size: 16px;
    line-height: 16px;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
  }

  .dropdown-options {
    position: absolute;
    width: 128px;
    background-color: #fff;
    color: #000;
    border-radius: 2px;
    border: 1px solid #ddd;
    padding-left: 0;
    left: 14px;
  }

  li {
    list-style: none;
    padding: 10px;
    font-size: 14px;
    line-height: 19px;
    cursor: pointer;
  }

  li:hover {
    background: #f5f5f5;
  }

  li:first-child::before,
  li:first-child::after {
    content: '';
    top: -10px;
    left: 65px;
    position: absolute;
    border-width: 0 10px 10px 10px;
    border-color: transparent transparent #ddd;
    border-style: solid;
  }

  li:first-child::after {
    margin-top: 1px;
    border-color: transparent transparent #fff;
  }

  li:first-child:hover::after {
    border-color: transparent transparent #f5f5f5;
  }
</style>
