<script lang="ts">
  // svelte imports
  import { onMount, onDestroy } from 'svelte';

  // UI imports
  import Icon from 'ui/elements/Icon.svelte';
  import back_arrow from 'one_click_checkout/topbar/icons/back_arrow';

  //i18n Imports
  import {
    BANNER_TITLE,
    BANNER_CONTENT_LABEL,
    BANNER_CTA_LABEL,
  } from 'one_click_checkout/address/consent/i18n/labels';
  import { t } from 'svelte-i18n';

  // Analytics imports
  import { Events } from 'analytics';
  import ModalEvents from 'one_click_checkout/address/consent/analytics';

  // store imports
  import {
    savedAddresses,
    consentViewCount,
  } from 'one_click_checkout/address/store';

  // service imports
  import {
    updateAddressConsentView,
    updateAddressConsent,
  } from 'one_click_checkout/address/service';

  // session imports
  import {
    setSavedAddresses,
    loadAddressesWithServiceability,
  } from 'one_click_checkout/address/sessionInterface';

  // utils imports
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { getThemeColor } from 'checkoutstore/theme';
  import { showAddressConsentError } from 'one_click_checkout/address/consent';

  const { consent_location } = getIcons();

  onMount(() => {
    updateAddressConsentView();
  });

  onDestroy(() => {
    if ($consentViewCount) {
      $consentViewCount -= 1;
    }
  });

  const handleSubmit = () => {
    Events.TrackRender(ModalEvents.BANNER_CTA_CLICKED);
    updateAddressConsent()
      .then((data) => {
        const { addresses } = data;
        setSavedAddresses([...$savedAddresses, ...addresses]);
        loadAddressesWithServiceability(true);
        $consentViewCount = 0;
      })
      .catch(() => {
        $consentViewCount = 0;
        showAddressConsentError({
          onSubmit: handleSubmit,
        });
      });
  };
</script>

<div class="consent-banner">
  <div class="consent-icon">
    <Icon icon={consent_location} />
  </div>
  <div class="banner-info">
    <div class="banner-title">{$t(BANNER_TITLE)}</div>
    <div class="banner-content">{$t(BANNER_CONTENT_LABEL)}</div>
    <div class="banner-cta theme" on:click={handleSubmit}>
      {$t(BANNER_CTA_LABEL)}
      <div class="cta-icon theme">
        <Icon icon={back_arrow(getThemeColor())} />
      </div>
    </div>
  </div>
</div>

<style>
  .consent-banner {
    display: flex;
    background-color: #f7f7f7;
    border-radius: 4px;
    align-items: center;
    padding: 18px 16px;
  }
  .banner-info {
    display: flex;
    flex-direction: column;
    padding-left: 14px;
    font-size: 12px;
  }
  .banner-title {
    padding-bottom: 6px;
  }
  .banner-content {
    color: #263a4ab0;
    padding-bottom: 12px;
    line-height: 17px;
  }
  .banner-cta {
    cursor: pointer;
    display: flex;
    align-items: center;
    font-weight: 600;
  }
  .cta-icon {
    padding-right: 6px;
    transform: rotate(180deg);
  }
  .consent-icon {
    height: 75px;
  }
</style>
