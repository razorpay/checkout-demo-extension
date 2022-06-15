<script lang="ts">
  import OptionIcon from 'ui/elements/options/OptionIcon.svelte';

  export let icon = null;
  export let title = '';
</script>

<div class="emboss selected-option">
  <OptionIcon {icon} />
  <div class="option-title">{title}</div>
</div>

<style>
  .selected-option {
    display: flex;
    align-items: center;
    height: 24px;
    user-select: none;
    color: #333;
    padding: 12px;
    border: 1px solid #e6e7e8;
    background-color: #fcfcfc;
  }

  :global(.option-icon) {
    width: 32px;
    margin-right: 16px;
  }
</style>
