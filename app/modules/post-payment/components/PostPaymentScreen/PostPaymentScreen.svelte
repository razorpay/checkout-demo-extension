<script lang="ts">
  import TrustedBadge from 'one_click_checkout/header/components/TrustedBadge.svelte';
  import { getAmount, getMerchantName } from 'razorpay';
  import { onMount } from 'svelte';
  import { getMethodName, getTimestamp } from './helper';
  import Icon from 'ui/elements/Icon.svelte';
  import { getThemeMeta } from 'checkoutstore/theme';
  import InfoIcon from 'ui/elements/InfoIcon.svelte';
  import { copyToClipboard } from 'common/clipboard';
  import circle_check from 'one_click_checkout/rtb_modal/icons/circle_check';
  import { formatAmountWithCurrency } from 'helper/currency';
  import type { PostPaymentScreenProps } from './types';
  import circle_cross from 'ui/icons/payment-methods/circle_cross';
  import { Events } from 'analytics';
  import { ANALYTICS_EVENTS, SUPPORT_URL, VIEW_STATE } from './constant';
  import { appliedOffer } from 'offers/store';
  import { fly } from 'svelte/transition';
  import {
    TIMER_CALLOUT,
    PAYMENT_SUCCESS,
    PAYMENT_FAILED,
    VISIT,
    FOR_QUERIES,
  } from 'post-payment/i18n/label';
  import { locale, t } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';

  let currentViewState = VIEW_STATE.MINIMAL;

  $: isMinimal = currentViewState === VIEW_STATE.MINIMAL;

  setTimeout(() => {
    currentViewState = VIEW_STATE.FULL_SCREEN;
  }, 1000);

  export let onComplete: () => void;
  export let data: PostPaymentScreenProps['data'];

  let isSuccess = data?.response?.razorpay_payment_id;
  const paymentId =
    data?.response?.razorpay_payment_id ||
    data?.response?.error?.metadata?.payment_id;

  let TIMER = 6;

  const timerInstance = setInterval(() => {
    TIMER -= 1;
    if (TIMER <= 0) {
      clearInterval(timerInstance);
      onComplete();
    }
  }, 1000);

  const { copy } = getThemeMeta().icons as {
    copy: string;
  };

  let fee = 0;
  let offerAmount = 0;

  $: {
    if (
      $appliedOffer &&
      $appliedOffer.original_amount &&
      $appliedOffer.amount
    ) {
      offerAmount = $appliedOffer.original_amount - $appliedOffer.amount;
    } else {
      offerAmount = 0;
    }
  }
  $: {
    fee = +(data?.requestPayload?.fee || 0);
    if (isNaN(fee)) {
      fee = 0;
    }
  }

  /** post this component we close the checkout */
  onMount(() => {
    // track
    Events.TrackRender(ANALYTICS_EVENTS.RENDER_TRANSITIONARY_SCREEN, {
      payment_status: isSuccess ? 'successful' : 'failed',
      payment_id: paymentId,
      method: getMethodName(data?.requestPayload?.method) || '-',
    });
  });
</script>

<div class="overlay-container" class:minimal={isMinimal}>
  <div
    class="screen-container"
    transition:fly|local={isMinimal
      ? { duration: 200, y: 20, delay: 300 }
      : { duration: 400 }}
  >
    <div class="status" class:success={isSuccess} class:failure={!isSuccess}>
      <div class="status-icon">
        {#if isSuccess}
          <Icon icon={circle_check('', 'white', '72', '72')} />
        {:else}
          <Icon icon={circle_cross('', '#fff')} />
        {/if}
      </div>
      <div class="status-text">
        {isSuccess ? $t(PAYMENT_SUCCESS) : $t(PAYMENT_FAILED)}
      </div>
      <div class="amount">
        {formatAmountWithCurrency(
          offerAmount > 0
            ? $appliedOffer?.amount || getAmount()
            : getAmount() + fee
        )}
      </div>
    </div>
    <div class="payment-details">
      <div>
        <div class="merchant-title">
          <div>{getMerchantName()}</div>
          <div class="rtb-badge-container">
            <TrustedBadge expanded={false} />
          </div>
        </div>
        <div class="timestamp">{getTimestamp()}</div>
      </div>
      <div>
        <div
          class="details"
          on:click={() => {
            copyToClipboard('body', paymentId || '');
            Events.TrackBehav(ANALYTICS_EVENTS.CLICK_COPY_PAYMENT_ID);
          }}
        >
          <div>{getMethodName(data?.requestPayload?.method) || '-'} |</div>
          <div class="payment-id">{paymentId}</div>
          <div class="copy-icon"><Icon icon={copy} /></div>
        </div>
        <div class="info">
          <span class="info-icon"><InfoIcon variant={'disabled'} /></span>
          {$t(VISIT)}
          <a
            href={SUPPORT_URL.url}
            target="_blank"
            rel="noopener"
            on:click={() => {
              Events.TrackBehav(ANALYTICS_EVENTS.CLICK_SUPPORT_LINK);
            }}
          >
            {SUPPORT_URL.text}
          </a>
          {$t(FOR_QUERIES)}
        </div>
      </div>
    </div>
    <div class="branding">
      <div class="redirecting">
        {formatTemplateWithLocale(TIMER_CALLOUT, { TIMER }, $locale)}
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .overlay-container {
    height: 100%;
    background: transparent !important;
    overflow: hidden;
    top: 0;
  }
  .screen-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 100%;
    transition: transform 0.5s ease-in-out;
  }

  .minimal .screen-container {
    transform: translateY(calc(100% - 273px));
    overflow: hidden;

    .status {
      height: 273px;
    }

    .amount {
      max-height: 0;
      overflow: hidden;
    }
  }

  .status {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;

    background: linear-gradient(
      97.21deg,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(0, 0, 0, 0.2) 100%
    );

    .status-icon {
      height: 72px;
      width: 72px;
      border: 8px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
    }

    .amount {
      transition: max-height 0.5s ease-out 0.2s;
      max-height: 100%;
      margin-top: 20px;
      margin-bottom: 14px;
      font-weight: 500;
      font-size: 24px;
      line-height: 130%;
    }

    .status-text {
      margin-top: 24px;
      font-size: 16px;
      font-weight: 600;
      line-height: 130%;
      text-align: center;
      color: rgba(255, 255, 255, 0.87);
    }
    &.success {
      background-color: #217613;
    }

    &.failure {
      background-color: #ba3737;
    }
  }

  .copy-icon {
    margin-left: 10px;
    cursor: pointer;
  }
  .payment-details {
    background-color: #fff;
    text-align: left;
    height: 140px;
    padding: 20px;
    display: flex;
    flex-direction: column;

    .timestamp {
      margin-top: 8px;
      font-weight: 400;
      font-size: 12px;
      line-height: 15px;
      color: rgba(22, 47, 86, 0.54);
    }
    .merchant-title {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;

      & > div:first-child {
        font-weight: 600;
        font-size: 20px;
        line-height: 24px;
        color: rgba(22, 47, 86, 0.87);
        max-width: 100%;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }

    .details {
      display: flex;
      font-size: 16px;
      line-height: 19px;
      color: #162f56de;
      margin-top: 30px;

      & > div:first-child {
        color: #162f568a;
        margin-right: 6px;
      }
    }

    .info {
      font-size: 11px;
      line-height: 13px;
      color: rgba(22, 47, 86, 0.54);

      a {
        color: #162f56de;
      }

      .info-icon :global(svg) {
        height: 8px;
        width: 8px;
      }
    }
  }
  .branding {
    display: flex;
    min-height: 40px;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    background-color: #f3f8fe;
    line-height: 40px;

    .redirecting {
      font-size: 11px;
      line-height: 20px;
      text-decoration-line: underline;
      color: #3f71d7;
    }
  }

  .rtb-badge-container {
    height: 20px;
    margin-left: 2px;

    :global(.rtb-icon-wrapper) {
      height: 20px;

      :global(img) {
        height: 20px;
        width: 20px;
      }
    }
  }

  .payment-id {
    max-width: 175px;
    overflow: hidden;
  }
</style>
