<script>
  // UI imports
  import Icon from 'ui/elements/Icon.svelte';
  import close from 'one_click_checkout/rtb_modal/icons/rtb_close';

  // Imports for RTB
  import { RTBExperiment } from 'rtb/store';
  import { isRTBEnabled as RTBEnabled } from 'rtb/helper';

  // session imports
  import { handleModalClose } from 'header/sessionInterface';

  import { getMerchantName, getOption, getPreferences } from 'razorpay';
  import TrustedBadge from 'one_click_checkout/header/components/TrustedBadge.svelte';
  import { truncateString } from 'utils/strings';
  import { expandedHeader } from 'header/store';
  import { slide } from 'svelte/transition';

  const isRTBEnabled = RTBEnabled($RTBExperiment);
  const merchantNameFallback = getPreferences('merchant_name') || '';
  const name = getMerchantName() || merchantNameFallback;
  const merchantName = truncateString(name, 20);

  const closeIcon = close('#B0B8C2');
</script>

<div id="header-wrapper" class:expanded={$expandedHeader}>
  <div class:with-rtb={isRTBEnabled}>
    <div class="header-container">
      {#if getOption('image') || merchantName}
        <div
          id="logo"
          class:image-frame={true}
          class:merchant-initials={!getOption('image')}
        >
          {#if getOption('image')}
            <img src={getOption('image')} alt="" />
          {:else}
            {merchantName.slice(0, 1).toUpperCase()}
          {/if}
        </div>
      {/if}
      <div class="header-title-wrapper">
        <p title={name} class="header-title">
          {merchantName}
        </p>
        {#if isRTBEnabled && !$expandedHeader}
          <div in:slide={{ delay: 150, duration: 150 }} class="rtb-section">
            <TrustedBadge expanded={$expandedHeader} />
          </div>
        {/if}
      </div>
      <button class="modal-close" on:click={handleModalClose}>
        <Icon icon={closeIcon} />
      </button>
    </div>
    {#if isRTBEnabled && $expandedHeader}
      <div
        out:slide={{ duration: 300 }}
        in:slide={{ duration: 300 }}
        class="rtb-expanded-section"
      >
        <TrustedBadge expanded={$expandedHeader} />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  #logo {
    margin-left: 9px;
    width: 30px;
    height: 30px;
    margin-bottom: 0;

    transition: height 0.2s, width 0.2s;

    img {
      border-radius: 4px;
      vertical-align: initial;
    }
  }

  .with-rtb {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid #e1e5ea;
    padding-bottom: 10px;
  }

  #logo {
    width: 30px;
    height: 30px;
    margin: 0 12px 0 0;
  }

  #logo.image-frame {
    background: none;
    box-shadow: none;
    padding: 0;
    width: 30px;
    height: 30px;
  }

  #logo.merchant-initials {
    background: var(--header-logo-bg-color);
    border-radius: 4px;
    color: var(--header-logo-text-color);
    font-size: 18px;
    line-height: 30px;
    font-weight: 500;
  }

  #header-wrapper {
    position: sticky;
    z-index: 2;
    padding: 0 16px;
    box-shadow: none;
  }

  .header-container {
    display: flex;
    justify-content: flex-start;
    padding: 12px 0;
    align-items: center;
    border-bottom: 0;
  }

  .header-container {
    border-bottom: 1px solid #e1e5ea;
  }

  .with-rtb .header-container {
    border-bottom: 0;
    padding-bottom: 0;
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

  .rtb-section {
    padding: 0;
    margin-left: 7px;
    align-self: center;
    margin-top: 1px;
  }

  .rtb-expanded-section {
    padding: 6px 0 0 0;
    align-self: flex-start;
    margin: 0;

    :global(.rtb-expanded-wrapper) {
      display: inline-flex;
    }
  }

  .header-title-wrapper {
    display: flex;
    align-items: center;
    flex: 1;
    flex-direction: row;
    align-items: center;
  }
  .expanded .header-title-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .modal-close {
    height: 20px;
    padding: 0px;
    position: relative;
    align-self: center;
    left: 2px;
  }
</style>
