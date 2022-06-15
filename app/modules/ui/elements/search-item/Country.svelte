<script lang="ts">
  // constants
  import RazorpayConfig from 'common/RazorpayConfig';

  export let item;
  const countryFlagsUrl = `${RazorpayConfig.cdn}country-flags/`;
</script>

<div class="list-data">
  {#if item.type === 'country'}
    <span>
      <img alt={item.label} src={`${countryFlagsUrl}${item.key}.svg`} />
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
    width: 20px;
    vertical-align: middle;
  }
</style>
