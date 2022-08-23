<script lang="ts">
  import Icon from 'ui/elements/Icon.svelte';
  import close_icon from 'one_click_checkout/rtb_modal/icons/rtb_close';
  import { isRedesignV15, getPreferences } from 'razorpay';
  import { popStack } from 'navstack';
  import { onDestroy } from 'svelte';
  import { Events } from 'analytics';
  import AccountEvents from 'account_modal/analytics';
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';

  const merchantPolicy: { url: string; display_name: string } =
    getPreferences('merchant_policy');
  const merchantURL = merchantPolicy.url;
  const merchantName: string = merchantPolicy.display_name;

  onDestroy(() => {
    Events.TrackBehav(AccountEvents.FOH_ABOUT_MERCHANT_DISMISSED, {
      screen_name: getCurrentScreen(),
    });
  });

  function onIFrameLoad() {
    Events.TrackRender(AccountEvents.FOH_IFRAME_RENDERING_COMPLETE);
  }
</script>

{#if isRedesignV15()}
  <div class="iframe-wrapper">
    <div class="iframe-top-bar">
      <div class="merchant-name">{merchantName}</div>
      <button class="account-toggle-icon" on:click={() => popStack()}>
        <Icon icon={close_icon()} />
      </button>
    </div>
    <iframe
      src={merchantURL}
      title={merchantName}
      class="merchant-iframe"
      on:load={onIFrameLoad}
    />
  </div>
{/if}

<style>
  .iframe-wrapper {
    height: 100%;
  }
  .merchant-iframe {
    width: 100%;
    height: calc(100% - 48px);
    border: 0;
  }

  .iframe-top-bar {
    width: 100%;
    box-sizing: border-box;
    height: 48px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e6e7e8;
  }

  .merchant-name {
    margin-left: 16px;
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
  }

  .account-toggle-icon {
    cursor: pointer;
    margin-right: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
  }

  .account-toggle-icon :global(svg) {
    height: 16px;
    width: 16px;
  }
</style>
