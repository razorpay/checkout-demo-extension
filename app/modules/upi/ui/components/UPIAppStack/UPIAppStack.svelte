<script lang="ts">
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { getDowntimeForUPIApp, getGridArray } from 'upi/helper';
  import { initiateNecessaryFlow } from './helper';
  import { getRecommendedAppsForUPIStack } from 'upi/features';
  import { selectedUPIAppForPay } from 'checkoutstore/screens/upi';
  import DowntimeCallout from 'ui/elements/Downtime/Callout.svelte';
  import { definePlatformReturnMethodIdentifier } from 'upi/helper';
  import { enableUPITiles } from 'upi/features';
  import { handleUPIPayments } from 'upi/payment';
  import { AppTile } from '../AppTile';
  import {
    storeActionForTracker,
    trackAppSelection,
    trackNoFlowAppSelection,
    trackOtherSelection,
  } from 'upi/events';
  import { OTHER_INTENT_APPS, UPI_APP_PAYMENT_SOURCES } from 'upi/constants';
  import { UPITracker } from 'upi/analytics/events';
  import { getSession } from 'sessionmanager';
  import { trackUPIAppsShown } from 'upi/analytics/helpers';

  const upiTiles = enableUPITiles();
  export let variant: UPI.AppStackVariant;

  export let method: string;
  export let maxItemInSingleRow = 4;
  export let limit = 4;
  export let onAppClick: (action: UPI.AppTileAction) => void;
  export let withOtherTile = variant === 'row';
  export let onOtherClick: Function;

  /**
   * If apps are defined, render them directly,
   * If apps are given by parent component, its fallback to default.
   */
  export let apps = getDefaultApps();
  export let normalizeDowntime = true;
  const session = getSession();

  function getDefaultApps() {
    return getRecommendedAppsForUPIStack(withOtherTile, limit);
  }
  const dispatch = createEventDispatcher();

  const onAppClickDefiner = definePlatformReturnMethodIdentifier();
  const rowCol = getGridArray<UPI.AppConfiguration>(maxItemInSingleRow, apps);

  function getIndexFromPosition(position: UPI.UpiAppForPay['position']) {
    if (position) {
      const { row, column } = position;
      return row * maxItemInSingleRow + column;
    }
  }

  onMount(() => {
    trackUPIAppsShown(rowCol, session.screen as string);
  });

  function isAppSelectedFromUpiAppStack() {
    return $selectedUPIAppForPay.source === UPI_APP_PAYMENT_SOURCES.app_grid;
  }

  function handleClick(
    app: UPI.AppConfiguration,
    position: UPI.UpiAppForPay['position']
  ) {
    dispatch('select', {
      app,
      index: getIndexFromPosition(position),
    });
    const action = onAppClickDefiner(app);
    storeActionForTracker(action);
    if (action === 'none' || variant === 'subText') {
      if (app && app.shortcode !== OTHER_INTENT_APPS.shortcode) {
        // flow absent, fallback to l1
        trackNoFlowAppSelection({ app, position });
      }
      if (app && app.shortcode === OTHER_INTENT_APPS.shortcode) {
        UPITracker.UPI_OTHERS_SELECTED();
        trackOtherSelection(variant);
      }
      if (onOtherClick) {
        onOtherClick();
      }
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
      UPITracker.UPI_APP_SELECTED({
        instrument: {
          name: app?.shortcode,
          type: 'intent',
        },
      });
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
              selected={$selectedUPIAppForPay.app?.shortcode ===
                app.shortcode && isAppSelectedFromUpiAppStack()}
              variant={variant !== 'subText' ? 'square' : 'circle'}
              {app}
              onClick={() => handleClick(app, { row, column })}
            >
              {#if $selectedUPIAppForPay?.app?.shortcode === app.shortcode && $selectedUPIAppForPay?.downtimeConfig?.severe && isAppSelectedFromUpiAppStack()}
                <div class="downtime-pointer" />
              {/if}
            </AppTile>
          {/each}
          {#if variant === 'subText' && row === 0}
            <span class="full-width">& More</span>
          {/if}
        </div>
        <div class="flex">
          {#if $selectedUPIAppForPay?.downtimeConfig?.severe && $selectedUPIAppForPay?.position?.row === row && isAppSelectedFromUpiAppStack()}
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
    -ms-grid-columns: 50px 50px 50px 50px;
    grid-template-columns: 50px 50px 50px 50px;
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
