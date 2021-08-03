<script>
  // UI imports
  import SlottedOption from 'ui/elements/options/Slotted/Option.svelte';
</script>

<SlottedOption disabled>
  <div slot="subtitle">
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
  div[slot='subtitle'] {
    color: rgba(81, 89, 120, 0.7);
  }
</style>
