<script lang="ts">
  import { isMobile } from 'common/useragent';
  import RazorpayStore, { getOption, isOneClickCheckout, isIRCTC } from 'razorpay';
  import { isMethodEnabled, getEMIBanks } from 'checkoutstore/methods';
  import { getAmount, disableAnimation } from './helper';
  import { getStore } from 'checkoutstore/cta';

  const emiBanks = getEMIBanks() as { BAJAJ: any };
  const cta = getStore();
  const noanim = disableAnimation();

  const isLiveMode = (RazorpayStore.razorpayInstance as any).isLiveMode();
</script>

<div
  id="container"
  class="mfix"
  class:mobile={isMobile()}
  class:test={!isLiveMode}
  class:notopbar={getOption('theme.hide_topbar')}
  class:noimage={!getOption('image')}
  class:noanim
>
  <div id="backdrop" />
  <div id="tnc-wrap" />
  <div id="modal" class="mchild">
    <div id="modal-inner">
      <div id="one-cc-loader" />
      <div id="overlay" />
      <div id="nocost-overlay" class="showable" />
      <div id="confirmation-dialog" class="showable" />
      <div id="emi-wrap" class="overlay showable mfix" />
      <div id="recurring-cards-wrap" class="overlay showable mfix" />
      <div id="fee-wrap" class="overlay showable mfix" />
      <div id="one-cc-summary" />
      <div id="options-wrap" />
      <div id="error-message" class="overlay showable">
        <div class="omnichannel">
          <img style="width:35px;" src="https://cdn.razorpay.com/app/googlepay.svg" alt="" />
          <div id="overlay-close" class="close">×</div>
        </div>
        <div id="fd-t" />
        <div class="spin"><div /></div>
        <div class="spin spin2"><div /></div>
        <span class="link" />
        <button id="fd-hide" class="btn">Retry</button>
        <div id="cancel_upi" />
      </div>
      <div id="content" class:one-cc={isOneClickCheckout()}>
        <div id="header">
          {#if getOption('theme.close_button')}
            <div id="modal-close" class="close">×</div>
          {/if}
          {#if getOption('image')}
            <div id="logo" class:image-frame={!getOption('theme.image_frame')}>
              <img src={getOption('image')} alt="" />
            </div>
          {/if}
          <div id="merchant">
            {#if getOption('name')}
              <div id="merchant-name">
                {getOption('name')}
              </div>
            {/if}
            <div id="merchant-desc">
              {getOption('description').trim()}
            </div>
            {#if getOption('amount')}
              <div id="amount">
                <span class="discount" />
                <span class="original-amount">{getAmount()}</span>
                <span class="fee" />
              </div>
            {/if}
          </div>
          <div id="language-dropdown" />
        </div>
        <div id="body" class="sub">
          <div id="topbar-wrap" />
          <div id="messages" />
          <form
            id="form"
            method="POST"
            novalidate
            autocomplete="off"
            on:submit|preventDefault={() => false}
          >
            <div id="root" />
            <div id="form-fields">
              <div id="body-overlay" />
              {#if isIRCTC()}
                <div class="recurring-message" style="right: 0;left: 0;border-radius:0 0 3px 3px">
                  <span>&#x2139;</span>
                  *Payment charges and taxes as applicable.
                </div>
              {/if}

              {#if isMethodEnabled('emi') && emiBanks.BAJAJ}
                <div class="tab-content showable screen" id="form-emi" />
              {/if}
            </div>
            <div id="bottom" />
            <div id="footer" role="button" class="button">
              <span id="footer-cta">{cta}</span>
            </div>
            <button type="submit" />
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  #logo.image-frame {
    background: none;
    box-shadow: none;
    padding: 0;
    width: 80px;
    height: 80px;
  }

  :global {
    .button,
    .btn,
    .submit-button,
    .loader::after {
      background: var(--primary-color);
      color: var(--text-color);
    }

    .elem::after {
      border-bottom-color: var(--highlight-color);
    }

    .address-elem::after {
      border: 0px;
    }

    .spin div,
    .link,
    .multi-tpv :checked + label {
      border-color: var(--highlight-color) !important;
    }

    .spinner {
      height: 12px;
      width: 12px;
      margin-right: 4px;
      border: 2px solid;
      border-color: var(--highlight-color) transparent var(--highlight-color) var(--highlight-color) !important;
      border-image: initial;
      border-radius: 50%;
      animation: 1s linear 0s infinite normal none running rotate;
    }

    @keyframes rotate {
      0% {
        transform: rotate(0);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .hc_border {
      border-color: var(--highlight-color) !important;
    }

    .hc_border:disabled {
      border-color: #ccc !important;
    }

    #cancel_upi .back-btn,
    .offer-info li:first-child,
    .options-list .option:hover,
    .options .option:hover,
    .options .option:focus {
      background: var(--hover-state-color);
    }

    .theme-highlight-color,
    .options .next-option:after {
      color: var(--highlight-color);
    }

    .dcc-view {
      background-color: var(--secondary-highlight-color);
    }

    .options .next-option.secondary-color:after {
      color: var(--background-color);
    }

    #header {
      background: var(--primary-color);
      color: var(--text-color);
    }

    #header.ios-paybtn-landscape-fix {
      padding-top: 10px;
      padding-bottom: 10px;
    }

    .option.active,
    :not(.saved-card).checked .checkbox,
    input[type='checkbox']:checked + .checkbox {
      color: #fff;
      background: var(--highlight-color);
      border-color: var(--highlight-color);
    }

    /* Svelte Checkbox */
    label.sv-checkbox.checked > .stack > input[type='checkbox']:checked::before {
      background: var(--highlight-color);
      border-color: var(--highlight-color);
    }
    label.sv-checkbox > .stack > input:focus::before {
      border-color: var(--highlight-color);
    }

    .options .option.selected {
      color: #333;
      background: var(--hover-state-color);
      border-color: var(--highlight-color);
      border-bottom: 1px solid var(--highlight-color) !important;
    }

    .theme {
      color: var(--primary-color);
    }

    #body .theme-border {
      border-color: var(--primary-color);
    }

    .theme-highlight,
    .offers-container header:before,
    .close-offerlist:before,
    .close-offerlist span,
    .remove-offer {
      color: var(--highlight-color);
    }

    .iframe-title,
    #topbar:before,
    .avs-card-info,
    .nvs-provider-info {
      background-color: var(--secondary-highlight-color) !important;
    }

    .offers-container header {
      background-color: var(--secondary-highlight-color);
    }

    .iframe-title,
    .grid label:hover,
    .auth-option:hover {
      background-color: var(--hover-state-color) !important;
    }

    .grid :checked + label {
      background-color: var(--active-state-color) !important;
      border-bottom: 2px solid var(--highlight-color);
    }

    .list :checked + label,
    .list .item.active {
      border-color: var(--highlight-color) !important;
    }

    .list :checked + label .checkbox:not(.inner-checkbox) {
      background: var(--highlight-color);
      border-color: var(--highlight-color);
    }

    .input-radio input[type='radio']:focus:not(:checked) + label .radio-display {
      border-color: var(--highlight-color);
    }

    .input-radio input[type='radio']:checked + label .radio-display {
      background-color: var(--highlight-color);
      border-color: var(--highlight-color);
    }

    .confirm-container {
      border-top: 2px solid var(--primary-color);
    }

    .qr-image:before,
    .iframe-title {
      border-color: var(--primary-color);
    }

    .offer-item.selected,
    .offer-item .checkbox {
      border-color: var(--highlight-color) !important;
    }

    .offer-item .checkbox {
      background-color: var(--highlight-color);
    }

    .expandable-card--expanded {
      border-color: var(--highlight-color);
    }

    /** Start: Styles for borders for a vertical list of items */

    .border-list > *:first-child {
      border-top-left-radius: 2px;
      border-top-right-radius: 2px;
    }

    .border-list > *:last-child {
      border-bottom-right-radius: 2px;
      border-bottom-left-radius: 2px;
    }

    .border-list:not(.touchfix) > *:not(.uninteractive):hover:not(:disabled),
    .border-list > *:focus,
    .border-list > *:focus-within,
    .border-list > .selected {
      border-color: var(--highlight-color);
      background-color: var(--hover-state-color);
    }

    .saved-card-cta:hover {
      border-color: var(--highlight-color);
    }

    .border-list > *:not(:last-child) {
      border-bottom: none;
    }

    .border-list:not(.touchfix) > *:hover:not(:disabled):not(.uninteractive) + *,
    .border-list > *:focus + *,
    .border-list > *:focus-within + *,
    .border-list > .selected + * {
      border-top-color: var(--highlight-color);
    }

    .trusted-badge-wrapper {
      background: var(--active-state-color);
    }

    .trusted-badge-header-section.active {
      border-bottom: 2px solid var(--active-state-color);
    }

    .arrow {
      border: solid var(--background-color);
    }

    /** End */

    /** Start: Styles for borders for a horizontal list of items */

    .border-list-horizontal > *:first-child {
      border-top-left-radius: 2px;
      border-bottom-left-radius: 2px;
    }

    .border-list-horizontal > *:last-child {
      border-bottom-right-radius: 2px;
      border-top-right-radius: 2px;
    }

    .border-list-horizontal:not(.touchfix) > *:not(.uninteractive):hover:not(:disabled),
    .border-list-horizontal > *:focus,
    .border-list-horizontal > *:focus-within,
    .border-list-horizontal > .selected {
      border-color: var(--highlight-color);
      background-color: var(--hover-state-color);
    }

    .border-list-horizontal > *:not(:last-child) {
      border-right: none;
    }

    .border-list-horizontal:not(.touchfix) > *:hover:not(:disabled):not(.uninteractive) + *,
    .border-list-horizontal > *:focus + *,
    .border-list-horizontal > *:focus-within + *,
    .border-list-horizontal > .selected + * {
      border-left-color: var(--highlight-color);
    }

    .coupons-available-container {
      background-color: var(--secondary-highlight-color);
      color: var(--highlight-color);
      border: 1px solid var(--secondary-highlight-color);
      display: flex;
      align-items: center;
      padding: 10px 12px;
      width: 100%;
      font-size: 14px;
      font-weight: 600;
    }

    .coupon-item-code {
      padding: 4px 8px;
      background-color: var(--secondary-highlight-color);
      color: var(--highlight-color);
      font-weight: 800;
      font-size: 14px;
      line-height: 20px;
      border: 1px dashed var(--highlight-color);
    }

    .highlight-text {
      color: var(--highlight-color);
    }

    .saved-addresses-cta {
      color: var(--highlight-color);
      font-weight: bold;
      border: 1px solid #e6e7e8;
      padding: 10px 12px;
      width: 100%;
      margin-bottom: 14px;
      display: inline-flex;
      justify-content: space-between;
      align-items: center;
    }

    .loading-indicator {
      border-radius: 50%;
      width: 33px;
      height: 33px;
      border: 1px solid;
      border-color: var(--highlight-color) transparent var(--highlight-color) var(--highlight-color) !important;
      animation: 1s linear 0s infinite normal none running rotate;
    }

    .summary-modal-cta {
      box-sizing: border-box;
      background: var(--primary-color);
      color: var(--text-color);
      font-weight: bold;
      padding: 15px 0;
      width: 100%;
      text-align: center;
    }
  }
</style>
