<script>
  export let item;
</script>

<div class="list-data">
  {#if item.type === 'country'}
    <span>
      <img
        alt={item.label}
        src={`https://cdn.razorpay.com/country-flag/${item._key}.svg`}
      />
    </span>
  {/if}
  <span>{item.label}</span>
</div>

<style>
  .list-data {
    display: flex;
    align-items: center;
  }

  .list-data img {
    margin-right: 10px;
  }
</style>
