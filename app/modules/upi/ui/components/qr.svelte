<script>
  import { onMount } from 'svelte';

  // UI imports
  import AsyncLoading from 'ui/elements/AsyncLoading.svelte';
  import NextOption from 'ui/elements/options/NextOption.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  //  Icon imports
  import InfoIcon from 'ui/elements/InfoIcon.svelte';
  import refreshIcon from 'upi/icons/refresh';
  import qrIcon from 'upi/icons/qr';

  // Store imports
  import { qrExpanded, qrUrl, timer, elapsed } from '../../store/qr';

  // Utils imports
  import RazorpayConfig from 'common/RazorpayConfig';
  import {
    createQR,
    setQrUrl,
    toggleQRTab,
    setFallback,
    calculateTime,
    paymentStatus,
  } from 'upi/helper';

  //  i18n imports
  import { QR_GENERATING_LABEL, QR_SCAN_ON_PHONE } from 'ui/labels/qr';
  import { QR_BLOCK_HEADING, SHOW_QR_CODE, SCAN_QR_CODE } from 'ui/labels/upi';
  import { t } from 'svelte-i18n';

  //  Analytics imports
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  // Props
  export let view = 'qr';
  export let loading = false;
  export let qrImage = null;
  export let selectedToken = undefined;

  $: minutes = Math.floor($timer / 60);
  $: seconds = Math.floor($timer - minutes * 60);

  function qrcallBack(res) {
    // callback function passed to createQR
    if (res.image_content) {
      //  setting the timer, storing the image_content and generating the QR code
      res.close_by ? timer.set(calculateTime(res.close_by)) : timer.set(900);
      setQrUrl(res.image_content);
      generateQRCode(res.image_content);
      //  starting to poll as soon we have a id (qr id)
      //   // from response
      paymentStatus(res.id);

      Analytics.track('render:upi_screen:upi_qr', {
        type: AnalyticsTypes.RENDER,
      });
    } else {
      // if image_content is missing from the response i.e QR api fails we fallback to old UI
      setFallback();
    }
  }

  function init() {
    view = 'qr';
    loading = true;
    createQR(qrcallBack);
  }
  function regenerateQR() {
    // reseting the qrUrl to empty string
    setQrUrl('');
    return init();
  }
  onMount(() => {
    if (selectedToken === null && !$qrExpanded) {
      toggleQRTab();
    }
    if ($qrUrl) {
      // generating QR code based on already saved image_content value
      generateQRCode($qrUrl);
    } else {
      init();
    }
  });

  function qrLoaded() {
    loading = false;
  }

  function generateQRCode(data) {
    // passing the image_content url to charts api to generate the QR image
    qrImage = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(
      data
    )}&choe=UTF-8&chld=L|0`;
    loading = false;
  }
</script>

<div class="new-qr">
  {#if !$qrExpanded}
    <!-- LABEL: Pay using QR Code -->
    <div class="legend left qr-label-padding">
      {$t(QR_BLOCK_HEADING)}
    </div>
    <div class="options" id="showQr">
      <NextOption
        icon={qrIcon()}
        tabindex="0"
        attributes={{
          role: 'button',
          'aria-label': 'Show QR Code - Scan the QR code using your UPI app',
        }}
        on:select={toggleQRTab}
      >
        <!-- LABEL: Show QR Code -->
        <div>{$t(SHOW_QR_CODE)}</div>
        <!-- LABEL: Scan the QR code using your UPI app -->
        <div id="qr-description" class="desc">{$t(SCAN_QR_CODE)}</div>
      </NextOption>
    </div>
  {/if}
  {#if view === 'qr' && $qrExpanded}
    {#if loading}
      <!-- LABEL: Generating QR Code... -->
      <AsyncLoading>{$t(QR_GENERATING_LABEL)}</AsyncLoading>
    {:else}
      <div class="qr-container">
        <div
          class="message"
          style="background-image: url('{RazorpayConfig.cdn}checkout/upi-apps.png')"
        >
          <!-- LABEL: Scan the QR using any UPI app on your phone like BHIM, PhonePe, Google Pay etc. -->
          {$t(QR_SCAN_ON_PHONE)}
        </div>
        {#if qrImage}
          <div class="qr-image">
            <img alt="QR" src={qrImage} on:load={qrLoaded} />
          </div>
          {#if $elapsed}
            <div class="qr-overlay">
              <span data-testid="qr-expiry-message">
                Previous QR code got expired
              </span>
            </div>
          {/if}
          {#if !$elapsed}
            <!-- count down timer is only displayed when then timer is not expired -->
            <div class="timer">
              <InfoIcon variant="disabled" />
              <div data-testid="timer-text">
                This QR Code is valid for
                <span
                  >{`${minutes}: ${
                    seconds < 10 ? `0${seconds}` : seconds
                  }`}</span
                > minutes
              </div>
            </div>
          {/if}
        {/if}
      </div>
    {/if}
    {#if $elapsed && !loading}
      <!-- Shows regenerate QR code button to regenerate once the timer is elapsed and QR is invalid -->
      <button type="button" on:click={regenerateQR}>
        <span class="button-text"
          >Generate New QR Code <Icon
            icon={refreshIcon('#FFFFFF', 'icon-margin')}
          /></span
        >
      </button>
    {/if}
  {/if}
  {#if $qrExpanded}
    <div class="qr-divider">OR</div>
  {/if}
</div>

<style>
  .qr-container {
    position: relative;
  }
  .new-qr {
    text-align: center;
    padding-top: 12px;
  }
  .message {
    background: no-repeat center bottom;
    background-size: 105px;
    padding-bottom: 29px;
    line-height: 1.6;
    font-size: 12px;
  }
  .message + .qr-image {
    display: block;
  }
  .qr-image {
    display: none;
    position: relative;
    overflow: hidden;
    width: 135px;
    margin: 10px auto;
  }
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
  img {
    z-index: 1;
    width: 125px;
    height: 125px;
    margin: 5px;
    display: block;
    position: relative;
  }
  .timer {
    font-size: 12px;
    line-height: 16px;
    color: #757575;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3px;
    div {
      margin-left: 5px;
    }

    span {
      color: #e31213;
    }
  }
  :global(.options .option.next-option::after) {
    transform: translateY(-50%) rotate(-88deg);
  }
  .qr-overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    bottom: 0;
    background: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0.85;
    z-index: 1000;
    span {
      color: #e31213;
      background: #ffffff;
    }
  }
  button {
    background: #3a97fc;
    padding: 10px 25px;
    font-size: 14px;
    line-height: 17px;
    color: #ffffff;
    border: 1px solid #3a97fc;
    border-radius: 2px;
  }
  .button-text {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  :global(.icon-margin) {
    margin-left: 6px;
  }

  .qr-label-padding {
    padding-left: 10px;
  }

  .qr-divider {
    display: flex;
    align-items: center;
    text-align: center;
    padding-top: 12px;
    color: rgba(22, 47, 86, 0.24);
  }
  .qr-divider::after,
  .qr-divider::before {
    content: '';
    border-bottom: 1px solid rgba(22, 47, 86, 0.24);
    flex: 1;
  }

  .qr-divider:not(:empty)::before {
    margin-right: 10px;
  }

  .qr-divider:not(:empty)::after {
    margin-left: 10px;
  }
</style>
