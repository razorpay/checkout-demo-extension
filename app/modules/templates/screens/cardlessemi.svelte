<script>
  // UI imports
  import NextOption from 'templates/views/ui/options/NextOption.svelte';

  // Props
  export let providers;
  export let on;

  export function select(event) {
    const { select = _Func.noop } = on;

    select(event);
  }
</script>

<div class="tab-content showable screen pad collapsible" id="form-cardless_emi">
  <input type="hidden" name="emi_duration" />
  <input type="hidden" name="provider" />
  <input type="hidden" name="ott" />
  <h3>Select an Option</h3>
  <div class="options">
    {#each providers as provider}
      <NextOption {...provider} on:select={select}>{provider.title}</NextOption>
    {/each}
  </div>
</div>
