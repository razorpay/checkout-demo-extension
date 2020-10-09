<script>
  export let tab;

  function replaceNode(node) {
    document.querySelector('#bottom').appendChild(node);

    return {
      destroy() {
        _El.detach(node);
      },
    };
  }
</script>

<style>
  .bottom[tab] {
    display: none;
  }

  :global(#form-common.drishy ~ #bottom .bottom[tab='common']),
  :global(#form-card.drishy ~ #bottom .bottom[tab='card']),
  :global(#form-emiplans.drishy ~ #bottom .bottom[tab='emiplans']),
  :global(#form-qr.drishy ~ #bottom .bottom[tab='qr']) {
    display: block;
  }
</style>

<div class="bottom" {tab} use:replaceNode>
  <slot />
</div>
