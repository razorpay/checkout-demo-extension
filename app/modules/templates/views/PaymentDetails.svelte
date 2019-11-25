<script>
  import Field from 'templates/views/ui/Field.svelte';
  import PartialPaymentOptions from 'templates/views/partialpaymentoptions.svelte';
  import Address from 'templates/views/address.svelte';
  import MultiTpvOptions from 'templates/views/ui/MultiTpvOptions.svelte';
  import TpvBank from 'templates/views/ui/TpvBank.svelte';
  import CardOffer from 'templates/views/ui/CardOffer.svelte';

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

  const showAddress = session.get('address');

  const prefilledEmail = session.get('prefill.email');
  const prefilledContact = session.get('prefill.contact');

  const isContactReadonly = session.get('readonly.contact') && prefilledContact;
  const isEmailReadonly = session.get('readonly.email') && prefilledEmail;

  const isContactHidden = session.get('hidden.contact') && optional.contact;
  const isEmailHidden = session.get('hidden.email') && optional.email;

  const contactEmailOptional = getStore('contactEmailOptional');

  const CONTACT_REGEX = optional.contact ? '.*' : '^\\+?[0-9]{8,15}$';
  const EMAIL_REGEX = optional.email
    ? '.*'
    : '^[^@\\s]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+$';

  $contact = prefilledContact || '';
  $email = prefilledEmail || '';
</script>

<style>
  .elem-wrap {
    padding: 0 24px;
  }

  .partial-payment-block {
    padding: 0 12px 24px 12px;
  }
</style>

<div transition:slide={{ duration: 400 }}>
  <div
    class="elem-wrap"
    class:invisible={isContactHidden}
    id="elem-wrap-contact">
    <Field
      id="contact"
      name="contact"
      type="tel"
      value={$contact}
      required={!optional.contact}
      pattern={CONTACT_REGEX}
      readonly={isContactReadonly}
      label="Phone"
      icon="&#xe607;"
      on:input={e => ($contact = e.target.value)}
      helpText="Please enter a valid contact number" />
  </div>
  <div class="elem-wrap" class:invisible={isEmailHidden} id="elem-wrap-email">
    <!-- TODO: add (optional) to label if email is optional -->
    <Field
      id="email"
      name="email"
      type="email"
      value={$email}
      required={!optional.email}
      pattern={EMAIL_REGEX}
      readonly={isEmailReadonly}
      label="Email"
      icon="&#xe603;"
      on:input={e => ($email = e.target.value)}
      helpText="Please enter a valid email. Example: you@example.com" />
  </div>
</div>

{#if order.partial_payment}
  <div class="partial-payment-block">
    <PartialPaymentOptions />
  </div>
{/if}

{#if showAddress && !order.partial_payment}
  <Address
    bind:address={$address}
    bind:pincode={$pincode}
    bind:state={$state}
    states={entries(session.states)} />
{/if}

{#if session.multiTpv}
  <MultiTpvOptions {bank} {icons} />
{:else if session.tpvBank}
  <TpvBank {bank} {accountName} showIfsc={contactEmailOptional} />
{/if}

{#if cardOffer}
  <CardOffer offer={cardOffer} />
{/if}
