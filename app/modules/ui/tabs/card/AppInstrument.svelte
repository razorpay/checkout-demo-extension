<script lang="ts">
  // UI imports
  import Radio from 'ui/elements/Radio.svelte';

  // Props
  export let value;
  export let selected = false;
</script>

<div
  class="instrument app-instrument"
  class:selected
  on:click
  on:keydown
  type="button"
  role="listitem"
>
  <div class="inner">
    <div class="app-card-container">
      <slot name="icon" />
    </div>
    <div class="title-container">
      <slot name="title" />
      <slot name="subtitle" />
    </div>
    <div class="radio">
      <Radio
        name="app-instrument"
        {value}
        checked={selected}
        classes="slotted"
        tabindex={-1}
      />
    </div>
  </div>
  <slot name="body" />
</div>

<style>
  .app-instrument {
    text-align: start;
    border: 0px;
    padding: 12px 24px;
    cursor: pointer;
  }

  .inner {
    display: flex;
    align-items: center;
  }
  .radio {
    flex-grow: 0;
    min-width: 18px;
    min-height: 18px;
    margin-top: -3px;
  }

  .title-container {
    padding-left: 0px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0px;
  }

  .app-card-container {
    flex-grow: 0;
    margin-right: 12px;
  }

  .selected {
    background-color: #f6f9fe;
  }

  :global(.one-cc) .app-instrument {
    padding: 12px 16px;
  }
</style>
