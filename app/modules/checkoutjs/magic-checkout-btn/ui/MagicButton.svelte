<svelte:options accessors />

<script>
  // svelte imports
  import { createEventDispatcher } from 'svelte';

  // constant imports
  import {
    DEFAULT_BUTTON_LABEL,
    PAGE_TYPES,
  } from 'checkoutjs/magic-checkout-btn/constants';

  export let width = '100%';
  export let borderRadius = '4px';
  export let pageType = PAGE_TYPES.CART;
  export let bgColor = '#0460f8';
  export let title = '';

  const dispatch = createEventDispatcher();

  let textToRender;
  $: {
    const { PRODUCT, PRODUCT_SM, CART, CART_SM } = PAGE_TYPES;
    switch (pageType) {
      case PRODUCT.page:
        textToRender = PRODUCT.text;
        break;
      case PRODUCT_SM.page:
        textToRender = PRODUCT_SM.text;
        break;
      case CART.page:
        textToRender = CART.text;
        break;
      case CART_SM.page:
        textToRender = CART_SM.text;
        break;
      default:
        textToRender = DEFAULT_BUTTON_LABEL;
    }
  }

  const handleClick = (ev) => {
    dispatch('click', ev);
  };
</script>

<button
  id="razorpay-magic-btn"
  style="
  width: {width} !important; 
  border-radius: {borderRadius} !important;
  background-color: {bgColor} !important;
  "
  data-testid="razorpay-magic-btn"
  on:click={handleClick}
>
  <svg
    width="12"
    height="15"
    viewBox="0 0 12 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="icon"
  >
    <path
      d="M5.14321 4.72412L4.47803 7.1758L8.28423 4.71034L5.7951 14.0119L8.32281 14.0142L11.9999 0.275635L5.14321 4.72412Z"
      fill="#F4F6FE"
    />
    <path
      d="M1.04646 10.1036L0 14.0138H5.18124C5.18124 14.0138 7.3005 6.06116 7.30109 6.05884C7.2991 6.06011 1.04646 10.1036 1.04646 10.1036Z"
      fill="#F4F6FE"
    />
  </svg>
  <slot name="title"><span>{title || textToRender}</span></slot>
</button>
