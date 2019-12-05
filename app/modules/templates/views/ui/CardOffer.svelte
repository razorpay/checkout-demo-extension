<script>
  export let offer;
</script>

<div class="pad" id="card-offer">
  {#if offer.name}
    <div class="text-btn">
      <strong>{offer.name}</strong>
    </div>
  {/if}
  {#if offer.display_text}{offer.display_text}{/if}
</div>
