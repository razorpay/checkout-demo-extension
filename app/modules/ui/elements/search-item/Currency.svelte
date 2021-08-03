<script>
  export let item;
</script>

<div class="left">{item.currency}</div>
<div class="middle">{item.name}</div>
<div class="right">{item.symbol}</div>

<style>
  .middle {
    flex-grow: 1;
    padding-left: 12px;
  }

  .left,
  .right {
    min-width: 36px;
  }

  .left {
    border-right: 1px solid #888;
  }

  .right {
    text-align: right;
    border-left: 1px solid #888;
  }
</style>
