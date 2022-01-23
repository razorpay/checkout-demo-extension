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
    background: #f4f5f6;
    box-sizing: border-box;
    border-radius: 19px;
    cursor: pointer;
    font-size: 12px;
    justify-content: center;
    align-items: center;
  }

  .selected-tag {
    color: var(--highlight-color);
    border: 1px solid var(--highlight-color);
  }

  .inner-text {
    margin-left: 2px;
  }
</style>
