<script>
  import Field from 'templates/views/ui/Field.svelte';
  import PartialPaymentOptions from 'templates/views/partialpaymentoptions.svelte';
  import Address from 'templates/views/address.svelte';

  import {
    contact,
    email,
    address,
    pincode,
    state,
  } from 'checkoutstore/screens/home';

  import { slide } from 'svelte/transition';

  const entries = _Obj.entries;

  const CONTACT_REGEX = '^\\+?[0-9]{8,15}$';
  const EMAIL_REGEX = '^[^@\\s]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+$';

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

  const prefill_email = session.get('prefill.email');
  const prefill_contact = session.get('prefill.contact');

  const contact_readonly = session.get('readonly.contact') && prefill_contact;
  const email_readonly = session.get('readonly.email') && prefill_email;

  const contact_hidden = session.get('hidden.contact') && optional.contact;
  const email_hidden = session.get('hidden.email') && optional.email;

  const contactEmailOptional = getStore('contactEmailOptional');

  $contact = prefill_contact || '';
  $email = prefill_email || '';
</script>

<style>
  .elem-wrap {
    padding: 0 24px;
  }

  .partial-payment-block {
    padding: 0 12px 24px 12px;
  }

  .multi-tpv {
    padding: 0 24px;
  }
</style>

<div transition:slide={{ duration: 400 }}>
  <div
    class="elem-wrap"
    class:invisible={contact_hidden}
    id="elem-wrap-contact">
    <Field
      id="contact"
      name="contact"
      type="tel"
      value={$contact}
      required={!optional.contact}
      pattern={CONTACT_REGEX}
      readonly={contact_readonly}
      label="Phone"
      icon="&#xe607;"
      on:input={e => ($contact = e.target.value)}
      helpText="Please enter a valid contact number" />
  </div>
  <div class="elem-wrap" class:invisible={email_hidden} id="elem-wrap-email">
    <!-- TODO: add (optional) to label if email is optional -->
    <Field
      id="email"
      name="email"
      type="email"
      value={$email}
      required={!optional.email}
      pattern={EMAIL_REGEX}
      readonly={email_readonly}
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
  <!-- TODO: move to separate component -->
  <div class="multi-tpv input-radio centered">
    <div class="multi-tpv-header">Pay Using</div>
    <input
      checked
      type="radio"
      name="method"
      id="multitpv-netb"
      value="netbanking" />
    <label for="multitpv-netb">
      <i>
        <img src="https://cdn.razorpay.com/bank/{bank.code}.gif" />
      </i>
      <div class="radio-display" />
      <div class="label-content">A/C: {bank.account_number}</div>
      <span>{bank.name}</span>
    </label>
    <input type="radio" name="method" id="multitpv-upi" value="upi" />
    <label for="multitpv-upi">
      <i>
        {@html icons.upi}
      </i>
      <div class="radio-display" />
      <div class="label-content">UPI Payment</div>
      <span>{bank.name} Account {bank.account_number}</span>
    </label>
  </div>
{:else if session.tpvBank}
  <!-- TODO: move to separate component -->
  <div class="customer-bank-details">
    <div class="bank-name">
      {#if bank.logo}
        <img src={bank.logo} />
      {/if}
      {#if bank.name}{bank.name}{:else}Bank Details{/if}
    </div>
    {#if bank.account_number}
      <div class="account-details clearfix">
        <div>Account Number</div>
        <div>{bank.account_number}</div>
      </div>
    {/if}
    {#if accountName}
      <div class="account-details clearfix">
        <div>Customer Name</div>
        <div>{accountName}</div>
      </div>
    {/if}
    {#if contactEmailOptional && bank.ifsc}
      <div class="account-details clearfix">
        <div>IFSC code</div>
        <div class="text-uppercase">{bank.ifsc}</div>
      </div>
    {/if}
  </div>
{/if}
{#if cardOffer}
  <div class="pad" id="card-offer">
    {#if cardOffer.name}
      <div class="text-btn">
        <strong>{cardOffer.name}</strong>
      </div>
    {/if}
    {#if cardOffer.display_text}{cardOffer.display_text}{/if}
  </div>
{/if}
