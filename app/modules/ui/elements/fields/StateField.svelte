<script lang="ts">
  import { STATE_HELP, STATE_LABEL } from 'ui/labels/home';
  import { t } from 'svelte-i18n';
  import { isRedesignV15 } from 'razorpay';
  import Select from 'ui/components/Select.svelte';

  export let value: string;
  export let states: [string, string][];
</script>

{#if isRedesignV15()}
  <Select
    label={$t(STATE_LABEL)}
    validationText={$t(STATE_HELP)}
    options={states.map(([value, label]) => ({
      value,
      label,
    }))}
    bind:value
    required
  />
{:else}
  <div class="elem select elem-state">
    <!-- LABEL: Select a value from list of states -->
    <div class="help">{$t(STATE_HELP)}</div>
    <i class="select-arrow">&#xe601;</i>
    <select class="input" required id="state" bind:value>
      <!-- LABEL: Select State -->
      <option value="">{$t(STATE_LABEL)}</option>
      {#each states as [code, text] (code)}
        <option value={code}>{text}</option>
      {/each}
    </select>
  </div>
{/if}
