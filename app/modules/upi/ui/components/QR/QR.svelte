<script lang="ts">
  // Svelte imports
  import { onDestroy, onMount } from 'svelte';

  // UI Imports
  import FormattedText from 'ui/elements/FormattedText/FormattedText.svelte';

  // Utils imports
  import RazorpayConfig from 'common/RazorpayConfig';
  import { clearActiveQRPayment, getQRImage } from 'upi/helper';
  import { startTimer, readableTimeLeft, clearTimer } from './timer';
  import { qrState, resetQRState, updateQrState } from './store';
  import { handleUPIPayments } from 'upi/payment';
  import { QR_EXPIRE_TIME, QR_OFF_SCREEN_POLL_DELAY_BY } from 'upi/constants';
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
  } from 'upi/i18n/labels';
  import { trackQRStatus, trackRefreshQR } from 'upi/events';

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
        resetQRState();
        Analytics.track(UPI_EVENTS.QR_GENERATION_FAIL, {
          reason: response.error.description,
        });
        break;
    }
  };
  const createQRPayment = (manualRefresh = true) => {
    updateQrState({ status: 'loading', manualRefresh });
    if (manualRefresh) {
      trackRefreshQR();
    }
    trackQRStatus('paymentInitiation');
    handleUPIPayments(
      {
        action: 'none',
        qrFlow: {
          onPaymentCreate: (data) => {
            updateQrState({
              url: data.qr_code_url || data.intent_url,
            });
            trackQRStatus('paymentResponse');
            startTimer(
              QR_EXPIRE_TIME,
              () => {
                clearActiveQRPayment(true);
                trackQRStatus('qrExpired');
              },
              true
            );
          },
        },
      },
      onResponse,
      {
        cancel: false,
        error: false,
      }
    );
  };

  onMount(() => {
    if ($qrState.autoGenerate && !$qrState.url) {
      createQRPayment(false);
    } else if ($qrState.url) {
      (fetch as unknown as CFU.Fetch).resumePoll();
    }
  });
  onDestroy(() => {
    if ($qrState.url) {
      // fetch pause
      (fetch as unknown as CFU.Fetch).setPollDelayBy(
        QR_OFF_SCREEN_POLL_DELAY_BY
      );
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
    trackQRStatus('qrLoaded');
  }
</script>

<div class="qrv2" data-testid="qrV2">
  <div class="qr-image">
    <img
      data-testid="qrv2-img"
      alt="QRV2"
      src={getQRImage($qrState.url)}
      on:load={qrImageLoaded}
      class:blur={$qrState.status !== 'qr'}
    />
    <div class="img-btn">
      {#if $qrState.status === 'loading'}
        <div
          data-testid="loading"
          data-content="loading"
          class="btn"
          on:click={() => {}}
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
          {$t(REFRESH_QR)}
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
      {#if $qrState.status === 'refresh'}
        {$t(QR_EXPIRED)}
      {:else if $qrState.url}
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
    margin: 20px;
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
    width: 100%;
    padding: 10px 0px 16px 0px;
    display: flex;
    justify-content: space-between;
  }
  .psp-logos > img {
    width: 18px;
    height: 18px;
  }
  #callout-text {
    color: #757575;
  }
  .blur {
    filter: blur(4px);
  }

  .qr-image {
    position: relative;
    overflow: hidden;
    width: 160px;
    height: 160px;
    flex: 0 0 160px;
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
    width: 150px;
  }

  .img-btn {
    z-index: 1;
    position: absolute;
    text-align: center;
  }
  .btn {
    border-radius: 100px;
    padding: 0px 12px;
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
