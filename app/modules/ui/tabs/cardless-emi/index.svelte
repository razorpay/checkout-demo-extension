<script>
  // UI imports
  import NextOption from 'ui/elements/options/NextOption.svelte';

  // Props
  export let providers = [];
</script>

<div class="tab-content showable screen pad collapsible" id="form-cardless_emi">
  <input type="hidden" name="emi_duration" />
  <input type="hidden" name="provider" />
  <input type="hidden" name="ott" />
  <h3>Select an Option</h3>
  <div class="options">
    {#each providers as provider}
      <NextOption {...provider} on:select>{provider.title}</NextOption>
    {/each}
  </div>
</div>
