<script>
  // UI imports
  import PartialPaymentOptions from 'ui/tabs/home/partialpaymentoptions.svelte';
  import Address from 'ui/elements/address.svelte';
  import MultiTpvOptions from 'ui/elements/MultiTpvOptions.svelte';
  import TpvBank from 'ui/elements/TpvBank.svelte';
  import ContactField from 'ui/components/ContactField.svelte';
  import EmailField from 'ui/components/EmailField.svelte';
  import CTAOneCC from 'one_click_checkout/cta/index.svelte';
  import Icon from 'ui/elements/Icon.svelte';

  // Store
  import {
    country,
    phone,
    contact,
    email,
    address,
    pincode,
    state,
    multiTpvOption,
    countryISOCode,
    prevContact,
  } from 'checkoutstore/screens/home';
  import { activeRoute } from 'one_click_checkout/routing/store';

  // Transitions
  import { fly } from 'svelte/transition';

  // Utils imports
  import { isAddressEnabled } from 'checkoutstore';
  import {
    isEmailHidden,
    isContactHidden,
    isPartialPayment,
    getMerchantOrder,
    getOption,
    isContactEmailOptional,
    isContactOptional,
    isOneClickCheckout,
  } from 'razorpay';
  import { toggleHeader } from 'one_click_checkout/header/helper';
  import { getIcons } from 'one_click_checkout/sessionInterface';

  import { isLoginMandatory } from 'one_click_checkout/store';
  import { getThemeMeta } from 'checkoutstore/theme';
  import { getAnimationOptions } from 'svelte-utils';

  import Analytics, { Events } from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { ContactDetailsEvents } from 'analytics/home/events';
  import {
    CONTACT_REGEX,
    EMAIL_REGEX,
    STATES,
    INDIA_COUNTRY_CODE,
    PHONE_REGEX_INDIA,
  } from 'common/constants';
  import { onMount } from 'svelte';
  import { screensHistory } from 'one_click_checkout/routing/History';

  import { t } from 'svelte-i18n';
  import { MANDATORY_LOGIN_CALLOUT } from 'ui/labels/home';
  import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
  import {
    CATEGORIES,
    ACTIONS,
  } from 'one_click_checkout/merchant-analytics/constant';
  import { views } from 'one_click_checkout/routing/constants';
  import { CONTACT_LABEL } from 'one_click_checkout/contact_widget/i18n/labels';
  import { CTA_LABEL } from 'one_click_checkout/cta/i18n';

  // Constants imports
  import {
    INDIA_CONTACT_ERROR_LABEL,
    CONTACT_ERROR_LABEL,
  } from 'one_click_checkout/address/i18n/labels';

  const entries = _Obj.entries;

  // Props
  export let tpv;
  export let newCta;
  export let onSubmit;

  const order = getMerchantOrder();
  const accountName = getOption('prefill.bank_account[name]');
  const icons = getThemeMeta().icons;
  const { user } = getIcons();
  const isOneCCEnabled = isOneClickCheckout();
  const isEditDetailScreen = $activeRoute?.name === views.DETAILS;
  const userContact = $contact;
  $prevContact = {
    country: $country,
    phone: $phone,
    email: $email,
  };
  let disabled = true;
  let validationText;

  function trackContactFilled() {
    const valid = CONTACT_REGEX.test($contact);
    Analytics.track('contact:fill', {
      type: AnalyticsTypes.BEHAV,
      data: {
        valid,
        value: $contact,
      },
    });
    Events.TrackBehav(ContactDetailsEvents.CONTACT_INPUT);
    validationText = getValidationText();
  }

  function trackEmailFilled() {
    const valid = EMAIL_REGEX.test($email);
    Analytics.track('email:fill', {
      type: AnalyticsTypes.BEHAV,
      data: {
        valid,
        value: $email,
      },
    });
    Events.TrackBehav(ContactDetailsEvents.CONTACT_EMAIL_INPUT);
  }

  $: {
    disabled = !(CONTACT_REGEX.test($contact) && EMAIL_REGEX.test($email));

    if ($country === INDIA_COUNTRY_CODE) {
      disabled = !PHONE_REGEX_INDIA.test($phone);
    }
  }

  onMount(() => {
    merchantAnalytics({
      event: ACTIONS.PAGE_VIEW,
      category: CATEGORIES.LOGIN,
      params: {
        page_title: CATEGORIES.LOGIN,
      },
    });
    Events.TrackRender(ContactDetailsEvents.CONTACT_SCREEN_LOAD, {
      previousScreen: screensHistory.previousRoute(),
    });
    if (isOneCCEnabled && isEditDetailScreen) {
      toggleHeader(false);
    }
  });

  const showAddress = isAddressEnabled() && !isPartialPayment();

  function onSubmitClick() {
    Events.TrackBehav(ContactDetailsEvents.CONTACT_DETAILS_SUBMIT, {
      contact: $contact,
      email: $email,
    });
    onSubmit(userContact);
  }

  function handleCountrySelect(countryInfo) {
    const { country } = countryInfo.detail;
    $countryISOCode = country;
  }

  // Phone Validation for 1CC
  function getValidationText() {
    if ($country === INDIA_COUNTRY_CODE) {
      return !PHONE_REGEX_INDIA.test($phone)
        ? $t(INDIA_CONTACT_ERROR_LABEL)
        : null;
    } else {
      return !CONTACT_REGEX.test($phone) ? $t(CONTACT_ERROR_LABEL) : null;
    }
  }
</script>

<div
  class:details-wrapper={isOneCCEnabled && isEditDetailScreen}
  in:fly={getAnimationOptions({ delay: 100, duration: 200, y: 40 })}
>
  {#if isLoginMandatory()}
    <div class="details-callout">{$t(MANDATORY_LOGIN_CALLOUT)}</div>
  {/if}
  {#if isOneCCEnabled && isEditDetailScreen}
    <div class="contact-title">
      <Icon icon={user} />
      <span class="contact-text">{$t(CONTACT_LABEL)}</span>
    </div>
  {/if}
  <div class="details-block" class:p-1cc={isOneCCEnabled}>
    {#if !isContactHidden()}
      <div class="contact-field">
        <ContactField
          bind:country={$country}
          bind:phone={$phone}
          isOptional={isContactOptional()}
          on:blur={trackContactFilled}
          on:input={trackContactFilled}
          on:countrySelect={handleCountrySelect}
          {validationText}
        />
      </div>
    {/if}
    {#if !isEmailHidden()}
      <div class="email-field">
        <EmailField bind:value={$email} on:blur={trackEmailFilled} />
      </div>
    {/if}
  </div>

  {#if isPartialPayment()}
    <div class="partial-payment-block">
      <PartialPaymentOptions {order} />
    </div>
  {/if}

  {#if showAddress}
    <div class="address-block">
      <Address
        bind:address={$address}
        bind:pincode={$pincode}
        bind:state={$state}
        states={entries(STATES)}
      />
    </div>
  {/if}

  {#if tpv && !tpv.invalid}
    {#if tpv.method}
      <div class="tpv-bank-block">
        <TpvBank bank={tpv} {accountName} showIfsc={isContactEmailOptional()} />
      </div>
    {:else}
      <div class="multi-tpv-block">
        <MultiTpvOptions
          bank={tpv}
          {icons}
          bind:selectedOption={$multiTpvOption}
        />
      </div>
    {/if}
  {/if}
  {#if newCta}
    <CTAOneCC on:click={onSubmitClick} {disabled} showAmount={false}>
      {$t(CTA_LABEL)}
    </CTAOneCC>
  {/if}
</div>

<style>
  .details-wrapper {
    padding: 28px 16px;
  }
  .details-block {
    padding: 0 24px;
  }
  .partial-payment-block {
    padding: 0 12px 12px 12px;
  }
  .multi-tpv-block {
    padding: 0 12px 12px;
  }
  .contact-field > :global(*) {
    margin-bottom: 16px;
  }

  .details-callout {
    padding: 20px 24px 0;
    font-weight: 700;
  }

  .p-1cc {
    padding: 8px 0px 8px;
  }

  .contact-title {
    display: flex;
    align-items: center;
    padding-bottom: 6px;
  }

  .contact-text {
    padding-left: 10px;
    font-weight: 600;
    font-size: 14px;
  }
</style>
