<script>
  // UI imports
  import PartialPaymentOptions from 'ui/tabs/home/partialpaymentoptions.svelte';
  import Address from 'ui/elements/address.svelte';
  import MultiTpvOptions from 'ui/elements/MultiTpvOptions.svelte';
  import TpvBank from 'ui/elements/TpvBank.svelte';
  import ContactField from 'ui/components/ContactField.svelte';
  import EmailField from 'ui/components/EmailField.svelte';
  import CTA from 'ui/elements/CTA.svelte';

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
  } from 'checkoutstore/screens/home';

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

  import { isLoginMandatory } from 'one_click_checkout/store';
  import { getThemeMeta } from 'checkoutstore/theme';
  import { getAnimationOptions } from 'svelte-utils';

  import Analytics, { Events } from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { ContactDetailsEvents } from 'analytics/home/events';
  import { CONTACT_REGEX, EMAIL_REGEX, STATES } from 'common/constants';
  import { onMount } from 'svelte';
  import { screensHistory } from 'one_click_checkout/routing/History';

  import { t } from 'svelte-i18n';
  import { MANDATORY_LOGIN_CALLOUT } from 'ui/labels/home';
  import { CtaViews as CTA_LABELS } from 'ui/labels/cta';

  const entries = _Obj.entries;

  // Props
  export let tpv;
  export let newCta;
  export let onSubmit;

  const order = getMerchantOrder();
  const accountName = getOption('prefill.bank_account[name]');
  const icons = getThemeMeta().icons;

  const userContact = $contact;
  let disabled = true;

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
  }

  onMount(() => {
    Events.TrackRender(ContactDetailsEvents.CONTACT_SCREEN_LOAD, {
      previousScreen: screensHistory.previousRoute(),
    });
  });

  const showAddress = isAddressEnabled() && !isPartialPayment();

  function onSubmitClick() {
    Events.TrackBehav(ContactDetailsEvents.CONTACT_DETAILS_SUBMIT, {
      contact: $contact,
      email: $email,
    });
    onSubmit(userContact);
  }
</script>

<div in:fly={getAnimationOptions({ delay: 100, duration: 200, y: 40 })}>
  {#if isLoginMandatory()}
    <div class="details-callout">{$t(MANDATORY_LOGIN_CALLOUT)}</div>
  {/if}
  <div class="details-block" class:pd-1cc={isOneClickCheckout()}>
    {#if !isContactHidden()}
      <div class="contact-field">
        <ContactField
          bind:country={$country}
          bind:phone={$phone}
          isOptional={isContactOptional()}
          on:blur={trackContactFilled}
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
    <CTA on:click={onSubmitClick} {disabled}
      >{$t(`cta.${CTA_LABELS.PROCEED}`)}</CTA
    >
  {/if}
</div>

<style>
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

  .pd-1cc {
    padding-top: 8px;
  }
</style>
