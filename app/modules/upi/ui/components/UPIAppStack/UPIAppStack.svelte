<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import {
    getRecommendedAppsForUPIStack,
    getDowntimeForUPIApp,
    initiateNecessaryFlow,
    getGridArray,
  } from 'upi/helper';
  import { selectedUPIAppForPay } from 'checkoutstore/screens/upi';
  import DowntimeCallout from 'ui/elements/Downtime/Callout.svelte';
  import {
    definePlatformReturnMethodIdentifier,
    enableUPITiles,
  } from 'upi/helper';
  import { handleUPIPayments } from 'upi/helper/payment';
  import { AppTile } from '../AppTile';
  import {
    storeActionForTracker,
    trackAppSelection,
    trackNoFlowAppSelection,
    trackOtherSelection,
  } from 'upi/events';
  import { OTHER_INTENT_APPS } from 'upi/constants';

  const upiTiles = enableUPITiles();
  export let variant: UPI.AppStackVariant = upiTiles.variant;

  export let method: string;
  export let maxItemInSingleRow = 4;
  export let limit = 4;
  export let onAppClick: (action: UPI.AppTileAction) => void;
  export let withOtherTile = variant === 'row';
  export let onOtherClick: Function;
  export let apps = getRecommendedAppsForUPIStack(withOtherTile, limit);
  export let normalizeDowntime = true;

  const dispatch = createEventDispatcher();

  const onAppClickDefiner = definePlatformReturnMethodIdentifier();
  const rowCol = getGridArray<UPI.AppConfiguration>(maxItemInSingleRow, apps);

  function getIndexFromPosition({ row, column }: UPI.UpiAppForPay['position']) {
    return row * maxItemInSingleRow + column;
  }

  function handleClick(
    app: UPI.AppConfiguration,
    position: UPI.UpiAppForPay['position']
  ) {
    dispatch('select', { app, index: getIndexFromPosition(position) });
    const action = onAppClickDefiner(app);
    storeActionForTracker(action);
    if (action === 'none' || variant === 'subText') {
      if (app && app.shortcode !== OTHER_INTENT_APPS.shortcode) {
        // flow absent, fallback to l1
        trackNoFlowAppSelection({ app, position });
      }
      if (app && app.shortcode === OTHER_INTENT_APPS.shortcode) {
        trackOtherSelection(variant);
      }
      onOtherClick();
    } else {
      const appForPay: UPI.UpiAppForPay = {
        app,
        downtimeConfig: getDowntimeForUPIApp(app, normalizeDowntime),
        position,
      };

      // enable for dev-testing
      // appForPay.downtimeConfig = {
      //   severe: 'low',
      //   downtimeInstrument: app.app_name || app.shortcode,
      // };
      trackAppSelection(appForPay);
      initiateNecessaryFlow(
        appForPay,
        selectedUPIAppForPay.set.bind(selectedUPIAppForPay as any),
        () => {
          if (onAppClick) {
            onAppClick(action);
          } else {
            handleUPIPayments({ action, app });
          }
        }
      );
    }
  }
</script>

<!-- 
    This component is supposed to work 
    only on UPI method and only if upiTiles feature is enabled.
   -->
{#if method !== 'upi' || !upiTiles.status}
  <span />
{:else}
  <div class="upi-app-stack">
    <div
      class={`upi-app-tile-stack${
        variant === 'row'
          ? ` options options-no-margin upi-app-tile-stack-column`
          : ' upi-app-tile-stack-subText'
      }`}
    >
      {#each rowCol as apps, row}
        <div
          class="upi-app-tile-stack-row"
          class:subtext={variant === 'subText'}
        >
          {#each apps as app, column}
            <AppTile
              selected={$selectedUPIAppForPay.app?.shortcode === app.shortcode}
              variant={variant !== 'subText' ? 'square' : 'circle'}
              {app}
              onClick={() => handleClick(app, { row, column })}
            >
              {#if $selectedUPIAppForPay?.app?.shortcode === app.shortcode && $selectedUPIAppForPay?.downtimeConfig?.severe}
                <div class="downtime-pointer" />
              {/if}
            </AppTile>
          {/each}
          {#if variant === 'subText' && row === 0}
            <span class="full-width">& more</span>
          {/if}
        </div>
        <div class="flex">
          {#if $selectedUPIAppForPay?.downtimeConfig?.severe && $selectedUPIAppForPay?.position?.row === row}
            <div class="upi-app-stack-downtime-callout">
              <DowntimeCallout
                showIcon={true}
                {...$selectedUPIAppForPay?.downtimeConfig}
              />
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}

<style lang="css">
  .subtext {
    margin-top: 0 !important;
  }
  .full-width {
    width: 100%;
  }
  .downtime-pointer {
    position: absolute;
    height: 14px;
    width: 14px;
    background: #fff1ae;
    border-radius: 2px;
    transform: rotate(45deg);
    border-bottom: 0;
    border-right: 0;
    bottom: -18px;
  }
  .flex {
    display: flex;
  }
  .upi-app-tile-stack {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    position: relative;
    width: 100%;
    overflow: hidden;
    background: none;
  }

  .upi-app-stack-downtime-callout {
    margin-top: 10px;
    width: 100%;
  }
  .upi-app-stack {
    display: flex;
    flex-direction: column;
  }
  .upi-app-tile-stack-row {
    margin-top: 18px;
    display: -ms-grid;
    display: grid;
    -ms-grid-columns: 60px 60px 60px 60px;
    grid-template-columns: 60px 60px 60px 60px;
    justify-content: space-between;
    width: 100%;
    margin-top: 18px;
  }

  .upi-app-tile-stack-row.subtext {
    display: flex;
    justify-content: flex-start;
  }

  .upi-app-tile-stack-column {
    flex-direction: column;
  }
  .upi-app-tile-stack-subText {
    align-items: center;
  }
</style>
