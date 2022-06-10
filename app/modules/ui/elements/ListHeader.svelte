<script>
  // UI imports
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
  export let warningMode = false;
</script>

<SlottedOption
  disabled
  id="list-header-option"
  className={warningMode ? 'warning-header' : undefined}
>
  <div slot="subtitle" class:defaultColor={!warningMode}>
    <slot name="subtitle" />
  </div>
  <div slot="icon" higher-css-specificity class="full-opacity higher-spec">
    <slot name="icon" />
  </div>
</SlottedOption>

<style>
  div[slot='icon'][higher-css-specificity].full-opacity.higher-spec {
    opacity: 1;
    margin-right: 0px;
  }
  div[slot='subtitle'].defaultColor {
    color: rgba(81, 89, 120, 0.7);
  }
  :global(#list-header-option.warning-header) {
    background: rgba(255, 219, 92, 0.2) !important;
    color: #cd8214;
  }
</style>
