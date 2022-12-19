<script lang="ts">
  import { slide } from 'svelte/transition';
  // UI imports
  import Icon from 'ui/elements/Icon.svelte';
  import close from 'one_click_checkout/rtb_modal/icons/rtb_close';

  // store imports
  import { activeRoute } from 'one_click_checkout/routing/store';
  import {
    headerVisible,
    headerHiddenOnScroll,
  } from 'one_click_checkout/header/store';
  import { offerFade } from 'header/store';

  // Imports for RTB
  import { RTBExperiment } from 'rtb/store';
  import { isRTBEnabled as RTBEnabled } from 'rtb/helper';

  // session imports
  import { handleModalClose } from 'one_click_checkout/header/sessionInterface';

  // utils imports
  import { getMerchantName } from 'razorpay';
  import TrustedBadge from 'one_click_checkout/header/components/TrustedBadge.svelte';
  import LanguageSelection from 'topbar/ui/components/LanguageSelection.svelte';
  import { truncateString } from 'utils/strings';
  import { getThemeMeta } from 'checkoutstore/theme';
  const themeMeta = getThemeMeta();

  // Other Imports
  import { views } from 'one_click_checkout/routing/constants';
  import { HEADER_ELEMENTS_COLOR } from 'one_click_checkout/header/constants';

  const isRTBEnabled = RTBEnabled($RTBExperiment);
  const merchantName = truncateString(getMerchantName(), 20);
  const closeIcon = close(20, 20, HEADER_ELEMENTS_COLOR);

  $: routeName = $activeRoute?.name;
</script>

{#if $headerVisible && !$headerHiddenOnScroll}
  <div
    id="header-1cc"
    in:slide
    out:slide={{ duration: 150 }}
    class:offers-fade={$offerFade}
  >
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
            <LanguageSelection color={themeMeta.textColor} />
          {/if}
        </div>
      </div>
      {#if isRTBEnabled}
        <div class="header-body-wrapper">
          <TrustedBadge expanded />
          <LanguageSelection color={themeMeta.textColor} />
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
    color: #fff;
    background-color: var(--primary-color);
    color: var(--text-color);
  }
  .header-title-wrapper {
    display: flex;
    justify-content: space-between;
    padding: 18px 16px 0px;
    align-items: center;
  }

  #header-1cc .header-title-wrapper-with-extra-padding {
    padding: 12px 16px 8px;
  }

  .header-title {
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-heading);
    line-height: 18px;
  }

  p {
    margin-block-start: 0;
    margin-block-end: 0;
  }

  .header-body-wrapper {
    display: flex;
    justify-content: space-between;
    padding: 8px 16px 12px;
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

  .header-wrapper {
    display: flex;
    flex-direction: column;
    padding: 12px 16px 0px;
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
    padding: 8px 16px 12px;
  }
</style>
