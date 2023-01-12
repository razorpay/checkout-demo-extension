<script lang="ts">
  // svelte imports
  import { onMount } from 'svelte';

  // UI imports
  import { shake as shakeForm } from 'checkoutframe/form';
  import PartialPaymentOptions from 'ui/tabs/home/partialpaymentoptions.svelte';
  import Address from 'ui/elements/Address.svelte';
  import MultiTpvOptions from 'ui/elements/MultiTpvOptions.svelte';
  import TpvBank from 'ui/elements/TpvBank.svelte';
  import TpvBankNew from 'ui/elements/TpvBank.new.svelte';

  import ContactField from 'ui/components/ContactField.svelte';
  import EmailField from 'ui/components/EmailField.svelte';
  import Icon from 'ui/elements/Icon.svelte';
  import TruecallerLogin from 'truecaller/ui/components/TruecallerLogin.svelte';
  import TruecallerNotification from 'truecaller/ui/components/TruecallerNotification.svelte';

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
  import {
    isContactAndEmailValid,
    isEmailValid,
    isContactValid,
    isOptionalEmail,
  } from 'one_click_checkout/common/details/store';
  import { shouldOverrideVisibleState } from 'one_click_checkout/header/store';
  import {
    moengageEventsData,
    updateMoengageEventsData,
  } from 'one_click_checkout/merchant-analytics/store';

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
    isRedesignV15,
    isEmailOptional,
    isOneClickCheckout,
  } from 'razorpay';
  import { toggleHeader } from 'one_click_checkout/header/helper';
  import { getIcons } from 'one_click_checkout/sessionInterface';
  import { getThemeMeta } from 'checkoutstore/theme';
  import { getAnimationOptions } from 'svelte-utils';
  import { screensHistory } from 'one_click_checkout/routing/History';
  import { getIndErrLabel } from 'one_click_checkout/helper';

  // analytics imports
  import Analytics, { Events, HomeEvents } from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import ContactDetailsEvents from 'one_click_checkout/contact_widget/analytics';
  import {
    merchantAnalytics,
    moengageAnalytics,
  } from 'one_click_checkout/merchant-analytics';
  import CouponEvents from 'one_click_checkout/coupons/analytics';
  import { META_KEYS } from 'truecaller/analytics/events';

  // i18n imports
  import { t } from 'svelte-i18n';
  import { CONTACT_LABEL } from 'one_click_checkout/contact_widget/i18n/labels';
  import { CONTACT_ERROR_LABEL } from 'one_click_checkout/address/i18n/labels';
  import { getPrefillBankDetails } from 'netbanking/helper';

  // Constants imports
  import {
    CATEGORIES,
    ACTIONS,
    MOENGAGE_EVENTS,
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
  import Bottom from 'ui/layouts/Bottom.svelte';
  import { validateEmail } from 'one_click_checkout/common/validators/email';
  import { getInputSource } from 'one_click_checkout/helper';
  import CTA from 'cta';
  import { CTA_LABEL } from 'cta/i18n';
  import { MiscTracker } from 'misc/analytics/events';

  // controller imports
  import { update as updateContactStorage } from 'checkoutframe/contact-storage';
  import {
    ERRORS,
    setCustomer,
    isTruecallerLoginEnabled,
    TRUECALLER_VARIANT_NAMES,
  } from 'truecaller';
  import { truecallerPresent } from 'truecaller/store';

  // type imports
  import type { UserVerifySuccessApiResponse } from 'truecaller/types';
  import { getPrefilledEmail } from 'checkoutframe/customer';
  import {
    setDefaultSelectedAddress,
    setSavedAddresses,
  } from 'one_click_checkout/address/sessionInterface';

  // Props
  export let tpv = undefined;
  export let onSubmit = undefined;
  export let showValidations = false;
  export let shouldUpdateEmail = false;

  let truecallerLoginFailed = false;

  const order = getMerchantOrder();
  const accountName = getPrefillBankDetails('name');
  const icons = getThemeMeta().icons;
  const { user } = getIcons();
  const isOneCCEnabled = isOneClickCheckout();
  const isRedesignV15Enabled = isRedesignV15();
  const isEditDetailScreen = $activeRoute?.name === views.DETAILS;
  let truecallerLoginEnabled = isTruecallerLoginEnabled(
    TRUECALLER_VARIANT_NAMES.contact_screen
  ).status;
  const userContact = $contact;
  $prevContact = {
    country: $country,
    phone: $phone,
    email: $email,
  };
  export let disabled = false;
  let validationText: string;

  function trackContactFilled(e: Event) {
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
    validationText = getValidationText() || '';
  }

  function handleBlurContact(event: Event) {
    try {
      MiscTracker.CONTACT_NUMBER_FILLED({
        user: {
          contact: {
            value: $contact,
          },
        },
      });
    } catch {}
    trackContactFilled(event);
  }

  function onContactBlur() {
    updateOrderWithCustomerDetails();

    if ($isContactValid) {
      Events.TrackBehav(CouponEvents.SUMMARY_MOBILE_ENTERED, {
        country_code: $country,
        contact_number: $phone,
      });

      updateMoengageEventsData({ 'Mobile Number': $phone });
      moengageAnalytics({
        eventName: MOENGAGE_EVENTS.MOBILE_ADDED,
        eventData: $moengageEventsData,
      });
    }
  }

  function onEmailBlur() {
    const source = getInputSource('email');

    updateOrderWithCustomerDetails();
    if ($isEmailValid) {
      Events.TrackBehav(CouponEvents.SUMMARY_EMAIL_ENTERED, {
        email_id: $email,
        source,
      });
    }
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
    try {
      MiscTracker.EMAIL_FILLED({
        user: {
          email: {
            value: $email,
          },
        },
      });
    } catch {}
  }

  $: disabled = !$isContactAndEmailValid;

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

    if (isRedesignV15Enabled && isEditDetailScreen) {
      toggleHeader(false);
    }
    try {
      MiscTracker.CONTACT_DETAILS();
    } catch {}
  });

  const showAddress = isAddressEnabled() && !isPartialPayment();

  export function onSubmitClick() {
    if (
      !$isContactValid ||
      (Boolean(getValidationText()) && !isContactOptional())
    ) {
      showValidations = true;
      shakeForm('#redesign-v15-cta', 'x-shake');
      return;
    }

    validateEmail($email).then((value) => {
      if (value || $isOptionalEmail) {
        Events.TrackBehav(ContactDetailsEvents.CONTACT_DETAILS_SUBMIT, {
          contact: $contact,
          email: $email,
        });
        updateContactStorage({
          contact: $contact,
          email: $email,
        });
        $shouldOverrideVisibleState = false;
        onSubmit(userContact);
        return;
      }
      showValidations = true;
      shakeForm('#redesign-v15-cta', 'x-shake');
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
        ? $t(getIndErrLabel($phone))
        : null;
    }
    return !CONTACT_REGEX.test($phone) ? $t(CONTACT_ERROR_LABEL) : null;
  }

  function onTruecallerClick() {
    truecallerLoginFailed = false;
  }

  /**
   * re-evaluate truecaller login enable status post trigger
   * - it could get disabled due to skip count reaching limit.
   */
  function postTruecallerTriggerStatusUpdate() {
    truecallerLoginEnabled = isTruecallerLoginEnabled(
      TRUECALLER_VARIANT_NAMES.contact_screen
    ).status;
  }

  export function onTruecallerLoginSuccess(
    detail: UserVerifySuccessApiResponse
  ) {
    postTruecallerTriggerStatusUpdate();
    Analytics.setMeta(META_KEYS.LOGIN_SCREEN_SOURCE, 'contact_details');

    getPrefilledEmail()
      ? setCustomer({
          ...detail,
          email: getPrefilledEmail(),
        })
      : setCustomer(detail);

    if (isOneClickCheckout()) {
      setSavedAddresses(detail.addresses);
      setDefaultSelectedAddress();
    }

    if (!isEmailOptional() && !getPrefilledEmail() && !detail.email) {
      shouldUpdateEmail = true;
      return;
    }

    onSubmitClick();
  }

  export function onTruecallerLoginError(detail: any) {
    const code = detail.code || '';

    if (![ERRORS.TRUECALLER_LOGIN_DISABLED].includes(code)) {
      truecallerLoginFailed = true;
    }

    postTruecallerTriggerStatusUpdate();
  }
</script>

{#if truecallerLoginFailed}
  <TruecallerNotification />
{/if}
<div
  id="payment-details-block"
  data-test-id="payment-details-block"
  class:details-wrapper={(isRedesignV15Enabled && !isOneClickCheckout()) ||
    isEditDetailScreen}
  in:fly={getAnimationOptions({ delay: 100, duration: 200, y: 40 })}
>
  {#if (isRedesignV15Enabled && !isOneClickCheckout()) || isEditDetailScreen}
    <div class="contact-title-container">
      <div class="contact-title">
        <Icon icon={user} />
        <span class="contact-text">{$t(CONTACT_LABEL)}</span>
      </div>

      {#if truecallerLoginEnabled && $truecallerPresent !== false}
        <TruecallerLogin
          on:click={() => onTruecallerClick()}
          on:success={(e) => onTruecallerLoginSuccess(e.detail)}
          on:error={(e) => onTruecallerLoginError(e.detail)}
        />
      {/if}
    </div>
  {/if}

  <div class="details-block">
    {#if !isContactHidden()}
      <div class="contact-field">
        <ContactField
          bind:country={$country}
          bind:phone={$phone}
          isOptional={isContactOptional()}
          on:blur={handleBlurContact}
          on:input={trackContactFilled}
          on:countrySelect={handleCountrySelect}
          showValidations={!$phone && isContactOptional()
            ? false
            : showValidations}
          {validationText}
          showTruecallerIcon={shouldUpdateEmail}
        />
      </div>
    {/if}
    <!-- if email is not optional then we need to show email field -->
    <!-- optional email can manipulate based on country code -->
    {#if !isEmailHidden() || !$isOptionalEmail}
      <div class="email-field">
        <EmailField
          bind:value={$email}
          on:blur={trackEmailFilled}
          {showValidations}
        />
      </div>
    {/if}
  </div>

  {#if isPartialPayment()}
    <div class="partial-payment-block">
      <PartialPaymentOptions {order} {showValidations} />
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
      {#if isRedesignV15Enabled}
        <Bottom>
          <div class="tpv-bank-block">
            <TpvBankNew
              bank={tpv}
              {accountName}
              showIfsc={isContactEmailOptional()}
            />
          </div>
        </Bottom>
      {:else}
        <div class="tpv-bank-block">
          <TpvBank
            bank={tpv}
            {accountName}
            showIfsc={isContactEmailOptional()}
          />
        </div>
      {/if}
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
  <!-- for 1cc only (checkout CTA handle by home) -->
  <CTA
    screen="home-1cc"
    tab={'details'}
    {disabled}
    show
    label={CTA_LABEL}
    showAmount={false}
    onSubmit={onSubmitClick}
  />
</div>

<style lang="scss">
  #payment-details-block {
    height: 100%;
    background-color: white;
  }
  .details-wrapper {
    padding: 16px 16px 28px;
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

  .contact-title {
    display: flex;
    align-items: center;
  }

  .contact-text {
    padding-left: 10px;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-body);
  }

  :global(.redesign) {
    .contact-field > :global(*) {
      margin-bottom: 14px;
    }

    .details-wrapper {
      padding: 20px;
    }

    .contact-text {
      font-size: 13px;
    }

    .multi-tpv-block,
    .details-block {
      padding: 0;
    }

    .partial-payment-block {
      padding: 0 0 24px 0;
    }
  }

  .contact-title-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
  }
</style>
