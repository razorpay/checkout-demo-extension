import { loadInterFont } from 'common/fonts';
import { internetExplorer } from 'common/useragent';
import { ATTRIBUTES_TO_WATCH } from 'checkoutjs/magic-checkout-btn/constants';
import MagicButton from 'checkoutjs/magic-checkout-btn/ui/MagicButton.svelte';

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

  #razorpay-magic-btn span {
    font-family: 'Inter' !important;
    font-weight: bold !important;
    font-size: 14px !important;
  }

  #razorpay-magic-btn .icon {
    margin-bottom: -1.1px;
  }
  </style>
`;

if (!internetExplorer && 'customElements' in window) {
  class MagicCheckoutBtn extends HTMLElement {
    constructor() {
      super();
      this._root = this.attachShadow({ mode: 'closed' });

      // checkout options
      this._options = {};

      // razorpay instance
      this._rzp = null;

      // adding fonts script
      loadInterFont();

      // adding button UI
      this._root.appendChild(template.content.cloneNode(true));

      // button node
      this._button = new MagicButton({
        target: this._root,
      });
    }

    static get observedAttributes() {
      return ATTRIBUTES_TO_WATCH;
    }

    // restyle button based on attributes
    restyle() {
      ATTRIBUTES_TO_WATCH.forEach((attr) => {
        const attrValue = this.getAttribute(attr);
        if (attrValue) {
          // map each attribute to component prop ( convert kebab-case to camelCase )
          const prop = attr.replace(/-([a-z])/g, (_, up) => up.toUpperCase());
          this._button[prop] = attrValue;
        }
      });
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
      const button = this._root.getElementById('razorpay-magic-btn');
      button.addEventListener('click', this.openRzpModal.bind(this));

      // TODO: deprecate this after "title" attribute usage
      setTimeout(() => {
        // handling slot use case ( eg <span slot="title" /> )
        const slotElem = this.querySelector('[slot="title"]');
        if (slotElem?.textContent) {
          this._button.title = slotElem.textContent;
        }
      });

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
