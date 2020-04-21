<script>
  export let offer;
</script>

<style>
  .card-offer {
    pointer-events: none;
    font-size: 12px;
    padding-bottom: 14px;
  }
</style>

<div class="pad card-offer">
  {#if offer.name}
    <div class="text-btn">
      <strong>{offer.name}</strong>
    </div>
  {/if}
  {#if offer.display_text}{offer.display_text}{/if}
</div>
