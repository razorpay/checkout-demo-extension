<script lang="ts">
  import { locale, locales } from 'svelte-i18n';
  import { getLocaleName } from 'i18n/init';
  import { popStack } from 'navstack';

  export let top;

  function select(code) {
    $locale = code;
    popStack();
  }
</script>

<ul class="dropdown-options" style={`top: ${top}px`}>
  {#each $locales as locale}
    <li on:click={() => select(locale)}>{getLocaleName(locale)}</li>
  {/each}
</ul>

<style>
  .dropdown-options {
    width: 128px !important;
    bottom: auto !important;
    color: #000;
    border-radius: 2px;
    border: 1px solid #ddd;
    padding-left: 0;
    left: 8px;
    margin-top: 36px;
    text-align: left;
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
