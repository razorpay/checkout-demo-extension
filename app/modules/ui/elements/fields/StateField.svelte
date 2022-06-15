<script lang="ts">
  import { STATE_HELP, STATE_LABEL } from 'ui/labels/home';
  import { t } from 'svelte-i18n';

  export let value;
  export let states;
</script>

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
