<script>
  import { createEventDispatcher } from 'svelte';

  import TagIcon from 'one_click_checkout/address/ui/components/TagIcon.svelte';

  const dispatch = createEventDispatcher();

  export let label;
  export let selected;
</script>

<div
  class="address-tag"
  class:selected-tag={selected}
  on:click={() => dispatch('select', { label })}
>
  <TagIcon {label} {selected} />
  <span class="inner-text">{label}</span>
</div>

<style>
  .address-tag {
    padding: 8px 16px;
    display: flex;
    flex-direction: row;
    width: 85px;
    margin-right: 8px;
    box-sizing: border-box;
    border-radius: 19px;
    cursor: pointer;
    font-size: 12px;
    justify-content: center;
    align-items: center;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: #ffffff;
  }

  .selected-tag {
    color: var(--highlight-color);
    border: 1px solid var(--highlight-color);
    background: var(--sec-highlight-color);
  }

  .inner-text {
    margin-left: 6px;
  }
</style>
