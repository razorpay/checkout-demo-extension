<script lang="ts">
  import { t } from 'svelte-i18n';

  export let text;
  export let expanded = false;
  export let type = 'primary';
</script>

<div class="badge" class:expanded class:secondary={type === 'secondary'}>
  {$t(text)}
</div>

<style>
  .badge {
    padding: 4px 8px;
    text-align: center;
    pointer-events: none;
    font-size: 9px;
    border-radius: 2px;
    font-weight: 600;
    text-transform: uppercase;
    background-color: #e5faed;
    color: #70c692;
  }
  .badge.secondary {
    background-color: #fafafa;
    color: #666666;
    font-size: 9px;
    font-weight: 400;
    text-transform: none;
  }
  .badge.expanded {
    width: auto;
    padding: 4px 2px;
  }
</style>
