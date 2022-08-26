<script lang="ts">
  import { slide } from 'svelte/transition';

  import DowntimeCallout from 'ui/elements/Downtime/Callout.svelte';
  import { linear } from 'svelte/easing';
  import { getAnimationOptions } from 'svelte-utils';
  // i18n
  import { t, locale } from 'svelte-i18n';
  import { qrRenderState } from './store';
  import Qr from '../QR/QR.svelte';
  import { PAY_WITH_UPI_QR } from 'upi/i18n/labels';
  import { getCustomDowntimeMessage } from './utils';
  export let parent: UPI.QRParent;
  let customDowntimeMessage = '';

  $: {
    customDowntimeMessage = getCustomDowntimeMessage(
      $qrRenderState.downtimePSPApps as string[],
      $locale
    );
  }
</script>

{#if (parent === 'homeScreen' && $qrRenderState.homeScreenQR) || (parent === 'upiScreen' && $qrRenderState.upiScreenQR)}
  <div
    class="methods-block"
    data-block={`${parent}-qr`}
    out:slide|local={getAnimationOptions({ easing: linear, duration: 300 })}
  >
    {#if parent === 'homeScreen'}<h3 class="title">
        <!-- LABEL: Pay using QR -->
        {$t(PAY_WITH_UPI_QR)}
      </h3>
    {:else}
      <div class="legend left">
        <!-- LABEL: Pay using QR -->
        {$t(PAY_WITH_UPI_QR)}
      </div>
    {/if}
    <div role="list" class="qr-v2-wrapper">
      <Qr {parent} />
      {#if customDowntimeMessage}
        <div class="qrv2-downtime-callout">
          <!-- Label: Google Pay is facing issues.  Please use other UPI apps.  -->
          <!-- Label: Google Pay, PayTM are facing issues.  Please use other UPI apps.  -->
          <DowntimeCallout
            severe="medium"
            avoidTrackers={true}
            downtimeInstrument=""
            customMessage={customDowntimeMessage}
          />
        </div>
      {/if}
      <div />
    </div>
  </div>
{/if}

<style>
  .qr-v2-wrapper {
    /* margin: 0px;
    padding: 20px; */
    border: 1px solid #e6e7e8;
  }
  /** Do not change the method name as this is being used to be in sync with homescreen*/
  .methods-block {
    margin-bottom: 24px;
  }
  .legend {
    margin-top: 10px;
    padding: 12px 0 8px 12px;
  }
  .qrv2-downtime-callout {
    margin: 12px 16px;
  }

  .title {
    margin: 20px 12px 12px;
  }
  :global(.redesign) {
    .qr-v2-wrapper {
      border: 1px solid var(--light-dark-color);
    }
  }
</style>
