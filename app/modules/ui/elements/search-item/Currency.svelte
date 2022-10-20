<script lang="ts">
  import { getCurrencyConfig } from 'common/currency';

  export let item;

  $: dir = getCurrencyConfig(item.currency)?.dir;
</script>

<div class="left">{item.name} ({item.currency})</div>
<div class="right" {dir}>{item.symbol}</div>

<style>
  .left {
    flex-grow: 1;
  }

  .right {
    min-width: 36px;
  }

  .right {
    text-align: right;
  }
</style>
