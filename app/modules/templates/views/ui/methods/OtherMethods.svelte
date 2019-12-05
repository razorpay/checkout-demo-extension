<script>
  // Svelte imports
  import { createEventDispatcher } from 'svelte';

  // UI imports
  import ListMethod from 'templates/views/ui/methods/ListMethod.svelte';
  import NextOption from 'templates/views/ui/options/NextOption.svelte';

  // Utils imports
  import DowntimesStore from 'checkoutstore/downtimes';
  import {
    getMethodDowntimeDescription,
    getMethodNameForPaymentOption,
  } from 'checkoutframe/paymentmethods';
  import { getSession } from 'sessionmanager';

  // Props
  export let AVAILABLE_METHODS = [];
  export let visible = false;
  export let standalone = false;
  export let instruments = [];

  // Computed
  export let methods;

  const dispatch = createEventDispatcher();
  const session = getSession();

  export function hideMethods() {
    dispatch('hideMethods');
  }

  function otherMethodsTransition(node, { delay = 0, duration = 200 }) {
    const o = +global.getComputedStyle(node).opacity;
    const circIn = t => {
      return 1.0 - Math.sqrt(1.0 - t * t);
    };

    const opacity = t => {
      let x = t * 3 * o;

      if (x > 1) {
        x = 1;
      }

      return x;
    };

    return {
      delay,
      duration,
      css: t => {
        t = circIn(t);
        return `opacity: ${opacity(t)}; top: ${240 *
          (1 - t)}px; overflow: hidden; position: absolute`;
      },
    };
  }

  $: {
    const downtimes = DowntimesStore.get();
    const down = downtimes.high.methods || [];

    methods = _Arr.map(AVAILABLE_METHODS, method => ({
      method,
      down: _Arr.contains(down, method),
      downMessage: getMethodDowntimeDescription(method, {
        availableMethods: AVAILABLE_METHODS,
        downMethods: downtimes.high,
      }),
      icon: session.themeMeta.icons[method],
      title: getMethodNameForPaymentOption(method, {
        session,
      }),
    }));
  }
</script>

<style>
  .othermethods:not(.standalone) {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    background: #ffffff;
    overflow: hidden;
    overflow-y: auto;
    padding: 0 0 12px 0;
  }

  .standalone #list-options {
    margin: 0;
  }
</style>

{#if visible}
  <div transition:otherMethodsTransition class="othermethods" class:standalone>
    {#if !standalone}
      <div class="legend">Select a payment method</div>
    {/if}
    <div class="options" class:pad={!standalone} id="list-options">
      {#if instruments && instruments.length && false}
        <!-- Hide this for now -->
        <NextOption
          on:select={hideMethods}
          type="down-arrow"
          arrowText="Show"
          icon={'&#xe714;'}>
          <span style="color:#858585">
            My Preferred Methods ({instruments.length})
          </span>
        </NextOption>
      {/if}
      {#if !standalone}
        <NextOption
          on:select={hideMethods}
          type="dark down-arrow"
          arrowText="Hide"
          icon={session.themeMeta.icons['othermethods']}>
          Other Methods
        </NextOption>
      {/if}
      {#each methods as method}
        <ListMethod
          {...method}
          on:select={event => dispatch('methodSelected', event.detail)} />
      {/each}
    </div>
  </div>
{/if}
