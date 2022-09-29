<script lang="ts">
  // ui imports
  import CartItem from 'one_click_checkout/cart/ui/CartItem.svelte';

  // store imports
  import { cartItems } from 'one_click_checkout/cart/store';

  // util imports
  import { getCartItemAnalyticsPayload } from 'one_click_checkout/cart/helpers';

  // analytics imports
  import { Events } from 'analytics';
  import CartEvents from 'one_click_checkout/cart/analytics';

  export let items = [];
  export let scrollable = false;
  export let screenName = '';

  $: {
    if (items.length) {
      items.forEach((item) => {
        Events.TrackRender(
          CartEvents.CART_ITEM_RENDER,
          getCartItemAnalyticsPayload(item, {
            totalItems: $cartItems.length,
            itemsShown: items.length,
            screenName,
          })
        );
      });
    }
  }
</script>

<div id="cart-list" class:scrollable>
  {#each items as item}
    <CartItem {...item} />
  {/each}
</div>

<style>
  .scrollable {
    overflow-y: scroll;
    max-height: var(--max-height, 'none');
  }
  #cart-list :global(.cart-item:not(:last-child)) {
    margin-bottom: 16px;
  }
</style>
