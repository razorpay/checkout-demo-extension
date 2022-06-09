import { loadInterFont } from 'common/fonts';
import { internetExplorer } from 'common/useragent';

const template = document.createElement('template');
template.innerHTML = `
  <style>
  * {
    padding: 0px;
    margin: 0px;
    border: 0px;
    box-sizing: border-box;
  }

  #razorpay-magic-btn {
    width: 100% !important; 
    padding: 14px !important; 
    background-color: #0460F8 !important; 
    color: #fff !important; 
    border-radius: 4px !important;
    cursor: pointer !important;
  }

  #razorpay-magic-btn slot {
    font-family: 'Inter' !important;
    font-weight: bold !important;
    font-size: 14px !important;
  }
  </style>
  <button id="razorpay-magic-btn">
    <svg
      width="12"
      height="15"
      viewBox="0 0 12 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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
    <slot name="title">
      Checkout with Magic
    </slot>
  </button>
`;

const PAGE_TYPES = {
  PRODUCT: 'product',
  PRODUCT_SM: 'product_sm',
  CART: 'cart',
  CART_SM: 'cart_sm',
};

if (!internetExplorer) {
  class MagicCheckoutBtn extends HTMLElement {
    constructor() {
      super();
      this._root = this.attachShadow({ mode: 'closed' });

      // checkout options
      this._options = {};

      // razorpay instance
      this._rzp = null;

      // button node
      this._button = null;

      // adding fonts script
      loadInterFont();

      // adding button UI
      this._root.appendChild(template.content.cloneNode(true));
    }

    static get observedAttributes() {
      return ['page-type', 'width', 'border-radius'];
    }

    // restyle button based on attributes
    restyle() {
      if (this.getAttribute('width')) {
        this._button.style.setProperty(
          'width',
          this.getAttribute('width'),
          'important'
        );
      }

      if (this.getAttribute('border-radius')) {
        this._button.style.setProperty(
          'border-radius',
          this.getAttribute('border-radius'),
          'important'
        );
      }

      let textContent = '';
      switch (this.getAttribute('page-type')) {
        case PAGE_TYPES.PRODUCT:
          textContent = 'Buy now with Magic';
          break;
        case PAGE_TYPES.PRODUCT_SM:
          textContent = 'Buy now';
          break;
        case PAGE_TYPES.CART:
          textContent = 'Checkout with Magic';
          break;
        case PAGE_TYPES.CART_SM:
          textContent = 'Checkout';
          break;
        default:
          textContent = 'Checkout with Magic';
      }
      this._root.querySelector('#razorpay-magic-btn slot').textContent =
        textContent;
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
      if (newVal !== oldVal) {
        this.restyle();
      }
    }

    get rzp() {
      return this._rzp;
    }

    set options(value) {
      this._options = value;
      this._rzp = new window.Razorpay(this._options);
    }

    openRzpModal(ev) {
      ev.stopPropagation();

      const { key, order_id, amount } = this._options;
      if (
        this.getAttribute('auto-checkout') === 'true' &&
        ((key && amount) || order_id)
      ) {
        this._rzp = new window.Razorpay(this._options);
        this._rzp.open();
      }

      this.dispatchEvent(new CustomEvent('click', ev));
    }

    connectedCallback() {
      this._button = this._root.getElementById('razorpay-magic-btn');
      this._button.addEventListener('click', this.openRzpModal.bind(this));

      this.restyle();
    }

    disconnectedCallback() {
      this._button.removeEventListener('click', this.openRzpModal.bind(this));
    }
  }

  if (!window.customElements.get('magic-checkout-btn')) {
    window.customElements.define('magic-checkout-btn', MagicCheckoutBtn);
  }
}
