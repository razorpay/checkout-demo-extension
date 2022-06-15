<script lang="ts">
  // svelte imports
  import { onMount } from 'svelte';

  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';
  import Checkbox from 'ui/elements/Checkbox.svelte';

  //i18n Imports
  import {
    MODAL_TITLE,
    MODAL_CONTENT_LABEL,
    MODAL_CTA_LABEL,
  } from 'one_click_checkout/address/consent/i18n/labels';
  import { t } from 'svelte-i18n';

  // Analytics imports
  import { Events } from 'analytics';
  import ModalEvents from 'one_click_checkout/address/consent/analytics';

  // store imports
  import {
    consentViewCount,
    consentGiven,
  } from 'one_click_checkout/address/store';

  // service imports
  import { updateAddressConsentView } from 'one_click_checkout/address/service';

  // utils Imports
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { getCurrentScreen } from 'one_click_checkout/analytics/helpers';
  import { popStack } from 'navstack';

  export let onSubmit;

  const { rtb_close: close } = getIcons();

  onMount(() => {
    updateAddressConsentView();
    $consentGiven = true;
    $consentViewCount -= 1;
    Events.TrackRender(ModalEvents.CONSENT_MODAL_LOADED);
  });

  const handleConsent = () => {
    $consentGiven = !$consentGiven;
  };

  const hide = () => {
    popStack();
  };

  const hideBottomSheet = () => {
    Events.TrackBehav(ModalEvents.CONSENT_MODAL_CLOSED, {
      screen_name: getCurrentScreen(),
    });
    hide();
  };

  const handleSubmit = () => {
    if (onSubmit) {
      Events.TrackBehav(ModalEvents.CONSENT_MODAL_CTA_CLICKED, {
        screen_name: getCurrentScreen(),
        permission_checked: $consentGiven,
      });
      if ($consentGiven) {
        $consentViewCount = 0;
      }
      onSubmit();
    }
    hide();
  };
</script>

<div class="consent-modal">
  <div class="header">
    <div class="title">{$t(MODAL_TITLE)}</div>
    <div class="consent-close" on:click={hideBottomSheet}>
      <Icon icon={close} />
    </div>
  </div>
  <div class="consent-content">
    <hr class="separator" />
    <div class="consent-info">
      <div class="consent-check-box">
        <Checkbox on:change={handleConsent} checked={$consentGiven} />
      </div>
      <p class="consent-text">{$t(MODAL_CONTENT_LABEL)}</p>
    </div>
  </div>
  <div class="cta-wrapper">
    <button class="consent-cta" on:click={handleSubmit}>
      {$t(MODAL_CTA_LABEL)}
    </button>
  </div>
</div>

<style>
  * {
    box-sizing: border-box;
    padding: 0px;
    margin: 0px;
  }
  .consent-modal {
    background: #fff;
    text-align: start;
    padding-top: 16px;
  }
  .consent-content {
    padding: 0px 16px 16px;
    border-radius: 4px;
  }
  .header {
    display: flex;
    align-items: center;
    padding: 0px 16px 16px;
  }
  .title {
    font-size: 14px;
    font-weight: 600;
  }
  .consent-close {
    position: absolute;
    right: 12px;
    cursor: pointer;
    height: 20px;
  }
  .consent-cta {
    font-family: 'Inter';
    width: 100%;
    padding: 18px;
    font-size: 14px;
    font-weight: 600;
    border-radius: 6px;
    color: var(--text-color);
    background: var(--primary-color);
    position: relative;
  }
  .consent-cta::after {
    left: 0;
    top: 0;
    opacity: 1;
    position: absolute;
    width: 100%;
    height: 100%;
    content: '';
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.1),
      rgba(0, 0, 0, 0.1)
    );
  }
  .cta-wrapper {
    padding: 18px 16px;
    box-shadow: 0px -4px 4px rgba(166, 158, 158, 0.08);
  }
  .separator {
    margin-top: 0px;
    margin-bottom: 16px;
    border: 1px solid #e1e5ea;
    border-bottom: none;
  }
  .consent-info {
    display: flex;
  }
  .consent-text {
    margin: 0px;
    padding-left: 4px;
    line-height: 20px;
  }
  .consent-check-box {
    padding-top: 4px;
  }
  :global(.mobile) .consent-modal {
    bottom: 0;
  }

  .consent-check-box :global(input[type='checkbox']::before) {
    border-radius: 2px;
  }
</style>
