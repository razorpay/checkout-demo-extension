<script>
  // UI imports
  import PartialPaymentOptions from 'ui/tabs/home/partialpaymentoptions.svelte';
  import Address from 'ui/elements/address.svelte';
  import MultiTpvOptions from 'ui/elements/MultiTpvOptions.svelte';
  import TpvBank from 'ui/elements/TpvBank.svelte';
  import ContactField from 'ui/components/ContactField.svelte';
  import EmailField from 'ui/components/EmailField.svelte';

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
  import {
    isContactEmailOptional,
    isPartialPayment,
    isEmailHidden,
    isContactHidden,
    isAddressEnabled,
    getMerchantOrder,
    getOption,
  } from 'checkoutstore';
  import { getThemeMeta } from 'checkoutstore/theme';
  import { getAnimationOptions } from 'svelte-utils';

  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';
  import { CONTACT_REGEX, EMAIL_REGEX, STATES } from 'common/constants';

  const entries = _Obj.entries;

  // Props
  export let tpv;

  const order = getMerchantOrder();
  const accountName = getOption('prefill.bank_account[name]');
  const icons = getThemeMeta().icons;

  function trackContactFilled() {
    const valid = CONTACT_REGEX.test($contact);
    Analytics.track('contact:fill', {
      type: AnalyticsTypes.BEHAV,
      data: {
        valid,
        value: $contact,
      },
    });
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
  }

  const showAddress = isAddressEnabled() && !isPartialPayment();
</script>

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
</style>

<div in:fly={getAnimationOptions({ delay: 100, duration: 200, y: 40 })}>
  <div class="details-block">
    {#if !isContactHidden()}
      <div class="contact-field">
        <ContactField
          bind:country={$country}
          bind:phone={$phone}
          on:blur={trackContactFilled} />
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
        states={entries(STATES)} />
    </div>
  {/if}

  {#if tpv}
    {#if tpv.method}
      <div class="tpv-bank-block">
        <TpvBank bank={tpv} {accountName} showIfsc={isContactEmailOptional()} />
      </div>
    {:else}
      <div class="multi-tpv-block">
        <MultiTpvOptions
          bank={tpv}
          {icons}
          bind:selectedOption={$multiTpvOption} />
      </div>
    {/if}
  {/if}
</div>
