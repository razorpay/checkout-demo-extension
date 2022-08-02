<script lang="ts">
  // svelte imports
  import { onMount } from 'svelte';

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
  import {
    isAddressEnabled,
    isEmailHidden,
    isContactHidden,
    isPartialPayment,
    getMerchantOrder,
    isContactEmailOptional,
    isContactOptional,
    isEmailOptional,
    isOneClickCheckout,
  } from 'razorpay';
  import { toggleHeader } from 'one_click_checkout/header/helper';
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { getThemeMeta } from 'checkoutstore/theme';
  import { getAnimationOptions } from 'svelte-utils';
  import { screensHistory } from 'one_click_checkout/routing/History';

  // analytics imports
  import Analytics, { Events, HomeEvents } from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import ContactDetailsEvents from 'one_click_checkout/contact_widget/analytics';
  import { merchantAnalytics } from 'one_click_checkout/merchant-analytics';
  import CouponEvents from 'one_click_checkout/coupons/analytics';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { CONTACT_LABEL } from 'one_click_checkout/contact_widget/i18n/labels';
  import { CTA_LABEL } from 'one_click_checkout/cta/i18n';
  import {
    INDIA_CONTACT_ERROR_LABEL,
    CONTACT_ERROR_LABEL,
  } from 'one_click_checkout/address/i18n/labels';
  import { getPrefillBankDetails } from 'netbanking/helper';

  // Constants imports
  import {
    CATEGORIES,
    ACTIONS,
  } from 'one_click_checkout/merchant-analytics/constant';
  import { views } from 'one_click_checkout/routing/constants';
  import {
    CONTACT_REGEX,
    EMAIL_REGEX,
    STATES,
    INDIA_COUNTRY_CODE,
    PHONE_REGEX_INDIA,
  } from 'common/constants';
  import { updateOrderWithCustomerDetails } from 'one_click_checkout/order/controller';
  import { isEmailValid } from 'one_click_checkout/common/validators/email';
  import { getInputSource } from 'one_click_checkout/helper';

  // Props
  export let tpv;
  export let newCta;
  export let onSubmit;
  export let valid = false;
  export let showValidations = false;

  const order = getMerchantOrder();
  const accountName = getPrefillBankDetails('name');
  const icons = getThemeMeta().icons;
  const { user } = getIcons();
  const isOneCCEnabled = isOneClickCheckout();
  const isEditDetailScreen = $activeRoute?.name === views.DETAILS;
  const isSummaryScreen = $activeRoute?.name === views.COUPONS;
  const userContact = $contact;
  $prevContact = {
    country: $country,
    phone: $phone,
    email: $email,
  };
  let disabled = true;
  let validationText;
  let validEmail = false;
  let validContact = false;

  $: valid = validEmail && validContact;

  function trackContactFilled(e) {
    const valid = CONTACT_REGEX.test($contact);
    Analytics.track('contact:fill', {
      type: AnalyticsTypes.BEHAV,
      data: {
        valid,
        value: $contact,
      },
    });
    Events.TrackBehav(ContactDetailsEvents.CONTACT_INPUT);
    if (e.type === 'blur' && isOneCCEnabled) {
      onContactBlur();
    }
    validationText = getValidationText();
  }

  function onContactBlur() {
    updateOrderWithCustomerDetails();
    Events.TrackBehav(CouponEvents.SUMMARY_MOBILE_ENTERED, {
      country_code: $country,
      contact_number: $phone,
    });
  }

  function onEmailBlur() {
    const source = getInputSource('email');

    updateOrderWithCustomerDetails();
    Events.TrackBehav(CouponEvents.SUMMARY_EMAIL_ENTERED, {
      email_id: $email,
      source,
    });
  }

  function trackEmailFilled(e) {
    const valid = EMAIL_REGEX.test($email);
    Analytics.track('email:fill', {
      type: AnalyticsTypes.BEHAV,
      data: {
        valid,
        value: $email,
      },
    });
    if (e.type === 'blur' && isOneCCEnabled) {
      onEmailBlur();
    }
    Events.TrackBehav(ContactDetailsEvents.CONTACT_EMAIL_INPUT);
  }

  $: disabled = !valid;

  onMount(() => {
    merchantAnalytics({
      event: ACTIONS.PAGE_VIEW,
      category: CATEGORIES.LOGIN,
      params: {
        page_title: CATEGORIES.LOGIN,
      },
    });
    if (isOneCCEnabled) {
      Events.TrackRender(ContactDetailsEvents.CONTACT_SCREEN_LOAD, {
        previousScreen: screensHistory.previousRoute(),
      });
    } else {
      Events.TrackRender(HomeEvents.CONTACT_SCREEN_LOAD, {
        previousScreen: screensHistory.previousRoute(),
        isContactOptional: isContactOptional(),
        isEmailOptional: isEmailOptional(),
      });
    }

    if (isOneCCEnabled && isEditDetailScreen) {
      toggleHeader(false);
    }
  });

  const showAddress = isAddressEnabled() && !isPartialPayment();

  function onSubmitClick() {
    if (!CONTACT_REGEX.test($contact)) {
      showValidations = true;
      return;
    }

    isEmailValid($email).then((value) => {
      if (value) {
        Events.TrackBehav(ContactDetailsEvents.CONTACT_DETAILS_SUBMIT, {
          contact: $contact,
          email: $email,
        });
        onSubmit(userContact);
        return;
      }
      showValidations = true;
    });
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
    }
    return !CONTACT_REGEX.test($phone) ? $t(CONTACT_ERROR_LABEL) : null;
  }
</script>

<div
  data-test-id="payment-details-block"
  class:details-wrapper={isOneCCEnabled && isEditDetailScreen}
  in:fly={getAnimationOptions({ delay: 100, duration: 200, y: 40 })}
>
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
          {showValidations}
          {validationText}
          bind:valid={validContact}
        />
      </div>
    {/if}
    {#if !isEmailHidden()}
      <div class="email-field">
        <EmailField
          bind:value={$email}
          on:blur={trackEmailFilled}
          {showValidations}
          bind:valid={validEmail}
        />
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
        states={Object.entries(STATES)}
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
