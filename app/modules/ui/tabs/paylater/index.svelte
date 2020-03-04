<script>
  // UI imports
  import Tab from 'ui/tabs/Tab.svelte';
  import NextOption from 'ui/elements/options/NextOption.svelte';

  // Props
  export let providers = [];
  export let on = {};

  export function select(event) {
    const { select = _Func.noop } = on;

    select(event);
  }
</script>

<Tab method="paylater">
  <input type="hidden" name="provider" />
  <input type="hidden" name="ott" />
  <h3>Select an Option</h3>
  <div class="options">
    {#each providers as provider}
      <NextOption
        attributes={{ 'data-paylater': provider.data.code }}
        tabindex={0}
        {...provider}
        on:select={select}>
        {provider.title}
      </NextOption>
    {/each}
  </div>
</Tab>
