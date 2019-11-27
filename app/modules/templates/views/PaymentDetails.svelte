<script>
  import PartialPaymentOptions from 'templates/views/partialpaymentoptions.svelte';
  import Address from 'templates/views/address.svelte';
  import MultiTpvOptions from 'templates/views/ui/MultiTpvOptions.svelte';
  import TpvBank from 'templates/views/ui/TpvBank.svelte';
  import CardOffer from 'templates/views/ui/CardOffer.svelte';

  import ContactField from 'templates/views/ui/fields/ContactField.svelte';
  import EmailField from 'templates/views/ui/fields/EmailField.svelte';

  import {
    contact,
    email,
    address,
    pincode,
    state,
  } from 'checkoutstore/screens/home';

  import { slide } from 'svelte/transition';

  const entries = _Obj.entries;

  export let getStore;
  export let session;

  const methods = session.methods;
  const cardOffer = session.cardOffer;
  const optional = getStore('optional');
  const order = session.order || {};

  const bank = session.tpvBank || {};
  const accountName = session.get('prefill.bank_account[name]');
  const icons = session.themeMeta.icons;

  const showAddress = session.get('address') && !order.partial_payment;

  const contactEmailOptional = getStore('contactEmailOptional');
</script>

<style>
  .details-block {
    padding: 0 24px;
  }
  .partial-payment-block {
    padding: 0 12px 12px 12px;
  }
</style>

<div class="details-block" transition:slide={{ duration: 400 }}>
  <ContactField {getStore} bind:value={$contact} />
  <EmailField {getStore} bind:value={$email} />
</div>

{#if order.partial_payment}
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
    <MultiTpvOptions {bank} {icons} />
  </div>
{:else if session.tpvBank}
  <div class="tpv-bank-block" transition:slide={{ duration: 400 }}>
    <TpvBank {bank} {accountName} showIfsc={contactEmailOptional} />
  </div>
{/if}

<!-- TODO: check if this can be removed -->
{#if cardOffer}
  <CardOffer offer={cardOffer} />
{/if}
