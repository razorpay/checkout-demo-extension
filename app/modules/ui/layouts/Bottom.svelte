<script>
  import { onMount } from 'svelte';
  export let tab;
  let ref;
  onMount(() => {
    document.querySelector('#bottom').appendChild(ref);
  });
</script>

<style>
  .bottom[tab] {
    display: none;
  }

  :global(#form-common.drishy ~ #bottom .bottom[tab='common']),
  :global(#form-card.drishy ~ #bottom .bottom[tab='card']),
  :global(#form-upi.drishy ~ #bottom .bottom[tab='upi']),
  :global(#form-upi_otm.drishy ~ #bottom .bottom[tab='upi_otm']),
  :global(#form-bank_transfer.drishy ~ #bottom .bottom[tab='bank_transfer']),
  :global(#form-emiplans.drishy ~ #bottom .bottom[tab='emiplans']),
  :global(#form-payouts.drishy ~ #bottom .bottom[tab='payouts']),
  :global(#form-qr.drishy ~ #bottom .bottom[tab='qr']) {
    display: block;
  }
</style>

<div class="bottom" {tab} bind:this={ref}>
  <slot />
</div>
