<script>
  // store imports
  import { activeRoute } from 'one_click_checkout/routing/store';
  import { headerVisible } from 'one_click_checkout/header/store';

  // Imports for RTB
  import { RTB } from 'checkoutstore/rtb';
  import { getTrustedBadgeHighlights } from 'trusted-badge/helper';

  // utils imports
  import { getMerchantName } from 'razorpay';
  import TrustedBadge from 'one_click_checkout/header/components/TrustedBadge.svelte';
  import LanguageSelection from 'one_click_checkout/header/components/LanguageSelection.svelte';

  // Other Imports
  import { views } from 'one_click_checkout/routing/constants';

  const isRTBEnabled = getTrustedBadgeHighlights($RTB);

  $: routeName = $activeRoute?.name;
</script>

{#if $headerVisible}
  <div id="header-1cc">
    {#if routeName === views.COUPONS}
      <div
        class="header-title-wrapper"
        class:header-title-wrapper-with-extra-padding={!isRTBEnabled}
      >
        <div class="header-title">
          {getMerchantName()}
        </div>
        {#if !isRTBEnabled}
          <LanguageSelection />
        {/if}
      </div>
      {#if isRTBEnabled}
        <div class="header-body-wrapper">
          <TrustedBadge expanded />
          <LanguageSelection />
        </div>
      {/if}
    {:else}
      <div class="header-title-wrapper header-title-wrapper-with-extra-padding">
        <div class="header-title">
          {getMerchantName()}
        </div>
        <div class="rtb-collapsed">
          <TrustedBadge />
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  #header-1cc {
    position: sticky;
    z-index: 2;
  }
  .header-title-wrapper {
    display: flex;
    justify-content: space-between;
    padding: 18px 16px 0px;
    align-items: center;
  }

  .header-title-wrapper-with-extra-padding {
    padding: 18px 16px;
  }

  .header-title {
    font-weight: 600;
    font-size: 16px;
    line-height: 18px;
  }

  .header-body-wrapper {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px 16px;
  }
</style>
