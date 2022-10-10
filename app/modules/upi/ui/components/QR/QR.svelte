<script lang="ts">
  // Svelte imports
  import { onDestroy, onMount, tick } from 'svelte';

  // UI Imports
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';

  // Utils imports
  import RazorpayConfig from 'common/RazorpayConfig';
  import {
    autoGenerateQREnabled,
    clearActiveQRPayment,
    getQRImage,
    updateV2FailureState,
  } from 'upi/helper';
  import {
    startTimer,
    readableTimeLeft,
    clearTimer,
    isCheckoutTimerBeyondCurrentTimer,
    getRelativeGracefulTime,
  } from './timer';
  import { qrState, resetQRState, updateQrState } from './store';
  import { handleUPIPayments } from 'upi/payment';
  import {
    QR_EXPIRE_TIME,
    QR_GRACEFUL_CANCEL_TIME,
    QR_OFF_SCREEN_POLL_DELAY_BY,
  } from 'upi/constants';
  import fetch from 'utils/fetch';

  // Analytics
  import Analytics from 'analytics';
  import UPI_EVENTS from 'ui/tabs/upi/events';

  // i18n

  import { locale, t } from 'svelte-i18n';
  import { formatTemplateWithLocale } from 'i18n';
  import {
    TIMER_CALLOUT_QR,
    REFRESH_QR,
    QR_EXPIRED,
    QR_SCAN_ON_PHONE,
    SHOW_QR,
    TIMER_CALLOUT_QR_LINE0,
  } from 'upi/i18n/labels';
  import {
    renderQRSection,
    trackQRStatus,
    trackQRGenerate,
    trackQRAutoGenerate,
  } from 'upi/events';
  import { returnAsIs } from 'lib/utils';

  export let parent: UPI.QRParent;

  const onResponse: UPI.PaymentResponseHandler = (status, response) => {
    // clear the old timer;
    clearTimer();
    switch (status) {
      case 'success':
        resetQRState();
        break;
      case 'cancel':
        /** QR Payment might have already cancelled from session hence don't reset again */
        break;
      case 'error':
        // in case new API throw error make sure we fallback to ajax api next time
        autoGenerateQREnabled() &&
          response.error.reason === 'qr_v2_disabled' &&
          updateV2FailureState(true);
        resetQRState();
        Analytics.track(UPI_EVENTS.QR_GENERATION_FAIL, {
          reason: response.error.description,
          parent,
        });
        break;
    }
  };
  const createQRPayment = (manualRefresh = true) => {
    updateQrState({ status: 'loading', manualRefresh });
    if (manualRefresh) {
      trackQRGenerate(parent);
    } else if (autoGenerateQREnabled() && manualRefresh === false) {
      trackQRAutoGenerate(parent);
    }
    trackQRStatus('paymentInitiation', parent);
    handleUPIPayments(
      {
        action: 'none',
        qrFlow: {
          onPaymentCreate: (data) => {
            trackQRStatus('paymentResponse', parent);
            const timerExpiresAt = startTimer(
              getRelativeGracefulTime(QR_EXPIRE_TIME, QR_GRACEFUL_CANCEL_TIME),
              () => {
                clearActiveQRPayment(true, true);
                trackQRStatus('qrExpired', parent);
              }
            );
            updateQrState({
              url: data.qr_code_url || data.intent_url,
              renderTimer: isCheckoutTimerBeyondCurrentTimer(
                timerExpiresAt + QR_GRACEFUL_CANCEL_TIME
              ),
            });
          },
          qrv2: autoGenerateQREnabled(), // means auto generate using QRv2 api
        },
      },
      onResponse,
      {
        cancel: false,
        error: manualRefresh,
      }
    );
  };

  onMount(() => {
    renderQRSection(parent);
    tick().then(() => {
      if ($qrState.autoGenerate && autoGenerateQREnabled() && !$qrState.url) {
        createQRPayment(false);
      } else if ($qrState.url) {
        fetch.resumePoll();
      }
    });
  });

  onDestroy(() => {
    if ($qrState.url) {
      // fetch pause
      fetch.setPollDelayBy(QR_OFF_SCREEN_POLL_DELAY_BY);
    }
  });

  function qrImageLoaded() {
    /**
     * we load dummay QR for UI purpose hence reject
     */
    if (!$qrState.url) {
      return;
    }

    updateQrState({ status: 'qr' });
    trackQRStatus('qrLoaded', parent);
  }
</script>

<div class="qrv2" data-testid="qrV2">
  <div class="qr-image">
    <img
      data-testid="qrv2-img"
      alt="QRV2"
      src={getQRImage(String($qrState.url))}
      on:load={qrImageLoaded}
      class:blur={$qrState.status !== 'qr'}
    />
    <div class="img-btn">
      {#if $qrState.status === 'loading'}
        <div
          data-testid="loading"
          data-content="loading"
          class="btn"
          on:click={returnAsIs}
        >
          <span>{$t('misc.loading')}</span>
          <div class="spinner spinner2" />
        </div>
      {:else if $qrState.status === 'refresh'}
        <div
          data-testid="refresh"
          data-content="refresh"
          class="btn"
          on:click={() => createQRPayment()}
        >
          <!-- Instead of creating a new QR state, we will reuse the refresh state with autoGenerate to detect the show QR need -->
          {$t($qrState.autoGenerate ? SHOW_QR : REFRESH_QR)}
        </div>
      {/if}
    </div>
  </div>
  <div class="qr-content">
    <div class="message">
      <!-- LABEL: Scan the QR using any UPI app on your phone -->
      {$t(QR_SCAN_ON_PHONE)}
    </div>
    <div class="psp-logos">
      {#each ['googlepay', 'phonepe', 'paytm', 'bhim'] as pspApp}
        <img
          src={`${RazorpayConfig.cdn}app/${pspApp}.svg`}
          alt={`${pspApp}-app-logo`}
        />
      {/each}
    </div>

    <div id="callout-text">
      {#if $qrState.status === 'refresh' && !$qrState.autoGenerate}
        {$t(QR_EXPIRED)}
      {:else if $qrState.renderTimer && $qrState.url}
        <!-- label: QR Code is valid for  -->
        <div>{$t(TIMER_CALLOUT_QR_LINE0)}</div>
        <FormattedText
          text={formatTemplateWithLocale(
            TIMER_CALLOUT_QR,
            { minutes: $readableTimeLeft },
            $locale
          )}
        />
      {/if}
    </div>
  </div>
</div>

<style>
  .qrv2 {
    display: flex;
    margin: 10px;
    justify-content: space-between;
  }

  .qr-content {
    margin: 10px 0px 10px 20px;
    text-align: left;
    line-height: 16px;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .psp-logos {
    width: 110px;
    padding: 10px 0px 16px 0px;
    display: flex;
    justify-content: space-between;
  }
  .psp-logos > img {
    width: 20px;
    height: 20px;
  }
  #callout-text {
    color: #757575;
  }
  .blur {
    filter: blur(1px);
    opacity: 0.5;
  }

  .qr-image {
    position: relative;
    overflow: hidden;
    width: 140px;
    height: 140px;
    flex: 0 0 140px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /**
  .qr-image:before will create the borders for image
  */
  .qr-image:before {
    position: absolute;
    left: 1px;
    right: 1px;
    top: 1px;
    bottom: 1px;
    border-width: 1px;
    border-style: solid;
    content: '';
  }

  /**
  .qr-image:after creates transparent rohmbus and create cutting-highliting borders for QR image 
  */
  .qr-image:after {
    position: absolute;
    width: 120%;
    height: 120%;
    left: -10%;
    top: -10%;
    transform: rotateZ(45deg);
    content: '';
    background: #fff;
  }
  .qr-image img {
    z-index: 1;
    width: 136px;
  }

  .img-btn {
    z-index: 1;
    position: absolute;
    text-align: center;
  }
  .btn {
    border-radius: 100px;
    padding: 0 16px;
    font-size: 14px;
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.4);
    text-transform: initial;
  }

  :global(.redesign) .btn {
    font-weight: 400;
  }

  .btn[data-content='loading'] {
    display: flex;
    align-items: center;
  }
  .btn[data-content='loading'] .spinner2 {
    margin-left: 8px;
  }

  .spinner2 {
    border-color: var(--highlight-color) var(--text-color)
      var(--highlight-color) var(--highlight-color) !important;
    height: 10px;
    width: 10px;
  }
</style>
