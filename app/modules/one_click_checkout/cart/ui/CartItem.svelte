<script lang="ts">
  // util imports
  import { formatAmountWithSymbol } from 'common/currency';
  import { getCurrency } from 'razorpay';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { QUANTITY_LABEL } from 'one_click_checkout/cart/i18n/label';

  export let name = '';
  export let price = '';
  export let image_url = '';
  export let quantity;

  const currency = getCurrency();
</script>

<div class="cart-item">
  <img alt="item-img" src={image_url} />
  <div class="info">
    <p class="text name shift-up">
      {name}
    </p>
    <p class="text quantity">{$t(QUANTITY_LABEL)}: {quantity}</p>
  </div>
  <p class="text price shift-up">
    {formatAmountWithSymbol(price, currency, false)}
  </p>
</div>

<style>
  * {
    box-sizing: border-box;
    margin: 0px;
    padding: 0px;
  }

  .cart-item {
    display: flex;
  }

  .info {
    padding: 0px 10px;
    flex: 2.2;
    white-space: nowrap;
    overflow: hidden;
  }

  img {
    height: 65px;
    width: 65px;
    border-radius: 2px;
    object-fit: contain;
    border: 0.7px solid rgba(141, 151, 161, 0.2);
  }

  .text {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
    color: var(--secondary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .name {
    margin-bottom: 2px;
  }

  .quantity {
    font-weight: var(--font-weight-regular);
  }

  .price {
    flex: 1;
    text-align: right;
  }

  .shift-up {
    position: relative;
    top: -2px;
  }
</style>
