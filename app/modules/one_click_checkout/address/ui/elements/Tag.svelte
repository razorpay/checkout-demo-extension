<script>
  // svelte imports
  import { createEventDispatcher } from 'svelte';

  // ui imports
  import TagIcon from 'one_click_checkout/address/ui/components/TagIcon.svelte';

  // util / helper imports
  import { t } from 'svelte-i18n';
  import { getI18nForTag } from 'one_click_checkout/address/helpersExtra';

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
  <span class="inner-text">{$t(getI18nForTag(label))}</span>
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
    margin-left: 4px;
  }

  .selected-tag {
    color: var(--highlight-color);
    border: 1px solid var(--highlight-color);
    background: var(--sec-highlight-color);
  }

  .inner-text {
    margin-left: 4px;
    margin-top: 2px;
  }
</style>
