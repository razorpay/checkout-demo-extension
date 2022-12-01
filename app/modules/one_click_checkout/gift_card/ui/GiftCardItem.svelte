<script lang="ts">
  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';
  import gift_card from 'one_click_checkout/gift_card/icons/giftcard';
  import rtb_close from 'one_click_checkout/rtb_modal/icons/rtb_close';

  // utils imports
  import { removeGiftCard } from 'one_click_checkout/gift_card/helpers';

  // constants
  import { constantCSSVars } from 'common/constants';
  import { MANUAL_GC_SOURCE } from 'one_click_checkout/gift_card/constants';

  export let giftCardNumber: string;

  const secondaryColor = constantCSSVars['secondary-text-color'];
</script>

<div class="list-item" data-testid="gift-card-item">
  <span class="item-icon">
    <Icon icon={gift_card(secondaryColor, secondaryColor, 18, 16)} />
  </span>
  <span class="list-content">
    <span class="dot" />
    <span class="dot" />
    <span class="dot" />
    <span class="dot" />
    {giftCardNumber.slice(giftCardNumber.length - 4)}
  </span>
  <span
    class="rmv-item"
    data-testid="rmv-item"
    data-test-id={`rmv-item-${giftCardNumber}`}
    on:click={() => removeGiftCard([giftCardNumber], MANUAL_GC_SOURCE)}
  >
    <Icon icon={rtb_close(12, 12, secondaryColor)} />
  </span>
</div>

<style>
  .list-item {
    display: flex;
    align-items: center;
    padding: 6px 4px;
    background-color: var(--background-color-magic);
    border-radius: 2px;
    margin: 10px 8px 0 0;
  }
  .rmv-item,
  .item-icon {
    height: 16px;
  }
  .rmv-item {
    cursor: pointer;
  }
  .list-content {
    font-size: var(--font-size-tiny);
    padding: 0 6px;
    display: flex;
    align-items: center;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--secondary-text-color);
    display: inline-block;
    margin-right: 2px;
  }
</style>
