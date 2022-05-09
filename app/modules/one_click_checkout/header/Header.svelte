<script>
  // UI imports
  import Icon from 'ui/elements/Icon.svelte';
  import close from 'one_click_checkout/rtb_modal/icons/rtb_close';

  // store imports
  import { activeRoute } from 'one_click_checkout/routing/store';
  import { headerVisible } from 'one_click_checkout/header/store';

  // Imports for RTB
  import { RTBExperiment } from 'rtb/store';
  import { isRTBEnabled as RTBEnabled } from 'rtb/helper';

  // session imports
  import { handleModalClose } from 'one_click_checkout/header/sessionInterface';

  // utils imports
  import { getMerchantName } from 'razorpay';
  import TrustedBadge from 'one_click_checkout/header/components/TrustedBadge.svelte';
  import LanguageSelection from 'one_click_checkout/header/components/LanguageSelection.svelte';
  import { truncateString } from 'utils/strings';

  // Other Imports
  import { views } from 'one_click_checkout/routing/constants';

  const isRTBEnabled = RTBEnabled($RTBExperiment);
  const merchantName = truncateString(getMerchantName(), 20);
  const closeIcon = close();

  $: routeName = $activeRoute?.name;
</script>

{#if $headerVisible}
  <div id="header-1cc">
    {#if routeName === views.COUPONS}
      <div class="header-wrapper" class:header-when-no-rtb={!isRTBEnabled}>
        {#if !isRTBEnabled}
          <button class="modal-close close-section" on:click={handleModalClose}>
            <Icon icon={closeIcon} />
          </button>
        {/if}
        <div class="title-section">
          <div class="header-container" class:title-container={isRTBEnabled}>
            <p class="header-title">
              {merchantName}
            </p>
            {#if isRTBEnabled}
              <button class="modal-close" on:click={handleModalClose}>
                <Icon icon={closeIcon} />
              </button>
            {/if}
          </div>
          {#if !isRTBEnabled}
            <LanguageSelection />
          {/if}
        </div>
      </div>
      {#if isRTBEnabled}
        <div class="header-body-wrapper">
          <TrustedBadge expanded />
          <LanguageSelection />
        </div>
      {/if}
    {:else}
      <div class="header-title-wrapper header-title-wrapper-with-extra-padding">
        <div class="header-container">
          <p class="header-title">
            {merchantName}
          </p>
          <div class="rtb-section">
            <TrustedBadge />
          </div>
        </div>
        <button class="modal-close" on:click={handleModalClose}>
          <Icon icon={closeIcon} />
        </button>
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

  #header-1cc .header-title-wrapper-with-extra-padding {
    padding: 18px 16px;
  }

  .header-title {
    font-weight: 600;
    font-size: 16px;
    line-height: 18px;
  }

  p {
    margin-block-start: 0;
    margin-block-end: 0;
  }

  .header-body-wrapper {
    display: flex;
    justify-content: space-between;
    padding: 8px 16px 18px;
  }

  .rtb-section {
    padding-left: 10px;
  }

  .header-container {
    display: flex;
    align-items: center;
  }

  .modal-close {
    height: 20px;
    padding: 0px;
    position: relative;
    left: 2px;
  }

  .title-container {
    justify-content: space-between;
    width: 100%;
  }

  .language-container {
    padding-left: 10px;
  }

  .header-wrapper {
    display: flex;
    flex-direction: column;
    padding: 18px 16px 0px;
  }

  .title-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .close-section {
    margin-bottom: 12px;
    align-self: flex-end;
  }

  .header-when-no-rtb {
    padding: 8px 16px 18px;
  }
</style>
