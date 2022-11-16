<script lang="ts">
  // utils
  import { getCurrencyConfig } from 'common/currency';

  // props
  export let item: { name: string; currency: DCC.Currency; symbol: string };
  ///- props

  $: dir = (getCurrencyConfig(item.currency) as { dir: string })?.dir;
</script>

<div class="left">{item.name} ({item.currency})</div>
<div class="right" {dir}>{item.symbol}</div>

<style lang="scss">
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
