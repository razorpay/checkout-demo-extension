<script>
  // svelte imports
  import { onMount } from 'svelte';

  // UI Imports
  import Icon from 'ui/elements/Icon.svelte';

  //i18n Imports
  import {
    MODAL_ERROR_TITLE,
    MODAL_ERROR_CONTENT_LABEL,
    MODAL_ERROR_CTA_LABEL,
  } from 'one_click_checkout/address/consent/i18n/labels';
  import { t } from 'svelte-i18n';

  // Analytics imports
  import { Events } from 'analytics';
  import ModalEvents from 'one_click_checkout/address/consent/analytics';

  // utils Imports
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { popStack } from 'navstack';

  export let onSubmit;

  const { rtb_close: close } = getIcons();

  onMount(() => {
    Events.TrackRender(ModalEvents.CONSENT_FAILED_MODAL_LOADED);
  });

  const hide = () => {
    Events.TrackRender(ModalEvents.CONSENT_FAILED_MODAL_CLOSED);
    popStack();
  };

  const handleSubmit = () => {
    Events.TrackRender(ModalEvents.CONSENT_FAILED_MODAL_CTA_CLICKED);
    if (onSubmit) {
      onSubmit();
    }
    hide();
  };
</script>

<div class="consent-modal">
  <div class="header">
    <div class="title">{$t(MODAL_ERROR_TITLE)}</div>
    <div class="consent-close" on:click={hide}>
      <Icon icon={close} />
    </div>
  </div>
  <div class="consent-content">
    <hr class="separator" />
    <div class="consent-info">
      <p class="consent-text">{$t(MODAL_ERROR_CONTENT_LABEL)}</p>
    </div>
  </div>
  <div class="cta-wrapper">
    <button class="consent-cta" on:click={handleSubmit}>
      {$t(MODAL_ERROR_CTA_LABEL)}
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
    padding-left: 6px;
    line-height: 20px;
  }
  :global(.mobile) .consent-modal {
    bottom: 0;
  }
</style>
