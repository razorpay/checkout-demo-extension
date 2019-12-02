<script>
  // UI imports
  import PartialPaymentOptions from 'templates/views/partialpaymentoptions.svelte';
  import Address from 'templates/views/address.svelte';
  import MultiTpvOptions from 'templates/views/ui/MultiTpvOptions.svelte';
  import TpvBank from 'templates/views/ui/TpvBank.svelte';
  import CardOffer from 'templates/views/ui/CardOffer.svelte';
  import ContactField from 'templates/views/ui/fields/ContactField.svelte';
  import EmailField from 'templates/views/ui/fields/EmailField.svelte';

  // Store
  import {
    contact,
    email,
    address,
    pincode,
    state,
    multiTpvOption,
  } from 'checkoutstore/screens/home';

  // Transitions
  import { slide } from 'svelte/transition';

  // Utils imports
  import CheckoutStore from 'checkoutstore';

  const entries = _Obj.entries;

  // Props
  export let session;

  const cardOffer = session.cardOffer;
  const order = session.order || {};
  const bank = session.tpvBank || {};
  const accountName = session.get('prefill.bank_account[name]');
  const icons = session.themeMeta.icons;

  const checkoutStore = CheckoutStore.get();
  const {
    contactEmailOptional,
    isPartialPayment,
    optional,
    prefill,
    readonly,
    hidden,
  } = checkoutStore;

  const isEmailHidden = hidden.email && optional.email;
  const isContactHidden = hidden.contact && optional.contact;

  const showAddress = checkoutStore.address && !isPartialPayment;
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

<div class="details-block" transition:slide={{ duration: 400 }}>
  {#if !isContactHidden}
    <div class="contact-field">
      <ContactField bind:value={$contact} />
    </div>
  {/if}
  {#if !isEmailHidden}
    <div class="email-field">
      <EmailField bind:value={$email} />
    </div>
  {/if}
</div>

{#if isPartialPayment}
  <div class="partial-payment-block" transition:slide={{ duration: 400 }}>
    <PartialPaymentOptions {order} />
  </div>
{/if}

{#if showAddress}
  <div class="address-block" transition:slide={{ duration: 400 }}>
    <Address
      bind:address={$address}
      bind:pincode={$pincode}
      bind:state={$state}
      states={entries(session.states)} />
  </div>
{/if}

{#if session.multiTpv}
  <div class="multi-tpv-block" transition:slide={{ duration: 400 }}>
    <MultiTpvOptions {bank} {icons} bind:selectedOption={$multiTpvOption} />
  </div>
{:else if session.tpvBank}
  <div class="tpv-bank-block" transition:slide={{ duration: 400 }}>
    <TpvBank {bank} {accountName} showIfsc={contactEmailOptional} />
  </div>
{/if}

{#if cardOffer}
  <CardOffer offer={cardOffer} />
{/if}
