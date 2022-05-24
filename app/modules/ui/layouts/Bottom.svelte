<script>
  import * as _El from 'utils/DOM';
  import { isStackPopulated } from 'navstack/helper';

  export let tab;

  function replaceNode(node) {
    // Doing it for secured-message only, needed for 1CC
    // TODO: test and go it for all cases
    // const element = document.getElementById(node?.firstElementChild?.id);
    const element = document.getElementById('secured-message');
    const parent = document.querySelector(
      isStackPopulated() ? '#root' : '#bottom'
    );

    if (parent && (!element || tab !== 'home-1cc')) {
      parent.appendChild(node);
    }

    return {
      destroy() {
        _El.detach(node);
      },
    };
  }
</script>

<div class="bottom" {tab} use:replaceNode>
  <slot />
</div>

<style>
  .bottom[tab] {
    display: none;
  }

  :global(#form-common.drishy ~ #bottom .bottom[tab='common']),
  :global(#form-card.drishy ~ #bottom .bottom[tab='card']),
  :global(#form-emiplans.drishy ~ #bottom .bottom[tab='emiplans']),
  :global(#form-qr.drishy ~ #bottom .bottom[tab='qr']),
  :global(#form-wallet.drishy ~ #bottom .bottom[tab='wallet']),
  :global(#form-international.drishy ~ #bottom .bottom[tab='international']) {
    display: block;
  }
</style>
