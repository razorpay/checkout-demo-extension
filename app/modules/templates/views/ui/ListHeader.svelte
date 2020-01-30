<script>
  // Svelte imports

  import SlottedOption from 'templates/views/ui/options/Slotted/Option.svelte';

  // Props
  export let type;
  export let classes = [];
  export let reverse = false;

  // Computed
  export let optionClasses;

  // Refs

  $: {
    const defaultClasses = ['option'];

    if (type) {
      defaultClasses.push(type);
    }

    if (reverse) {
      defaultClasses.push('reverse');
    }

    optionClasses = defaultClasses.concat(classes).join(' ');
  }
</script>

<style>
  div[slot='icon'].full-opacity.higher-spec {
    opacity: 1;
    margin-right: 0px;
  }
  div[slot='subtitle'] {
    color: rgba(81, 89, 120, 0.7);
  }
</style>

<SlottedOption defaultStyles disabled>
  <div slot="subtitle">
    <slot name="subtitle" />
  </div>
  <div slot="icon" class="full-opacity higher-spec">
    <slot name="icon" />
  </div>
</SlottedOption>
