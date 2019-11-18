<script>
  // UI imports
  import Tab from 'templates/tabs/Tab.svelte';
  import Screen from 'templates/layouts/Screen.svelte';
  import Field from 'templates/views/ui/Field.svelte';
  import PartialPaymentOptions from 'templates/views/partialpaymentoptions.svelte';
  import RadioOption from 'templates/views/ui/options/RadioOption.svelte';
  import SlottedOption from 'templates/views/ui/options/Slotted/Option.svelte';
  import NewMethodsList from 'templates/views/ui/methods/NewMethodsList.svelte';

  import { slide, fly } from 'svelte/transition';

  export let getStore;
  export let session;
  export let methods;

  const attr = attr => attr.replace(/"/g, '');

  const entries = _Obj.entries;

  const CONTACT_REGEX = '^\\+?[0-9]{8,15}$';
  const EMAIL_REGEX = '^[^@\\s]+@[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+$';

  const o = session.get;

  const optional = getStore('optional');
  const order = session.order || {};
  const cardOffer = session.cardOffer;

  const address = o('address');
  const bank = session.tpvBank || {};

  const icons = session.themeMeta.icons;

  const firstPaymentMinAmount = session.formatAmountWithCurrency(
    order.first_payment_min_amount
  );

  const contactEmailOptional = getStore('contactEmailOptional');

  const prefill_email = attr(o('prefill.email'));
  const prefill_contact = attr(o('prefill.contact'));
  const prefill_name = attr(o('prefill.name'));

  const contact_hidden = o('hidden.contact') && optional.contact;
  const email_hidden = o('hidden.email') && optional.email;

  const contact_readonly = o('readonly.contact') && prefill_contact;
  const email_readonly = o('readonly.email') && prefill_email;
  const name_readonly = o('readonly.name') && prefill_name;

  const accountName = o('prefill.bank_account[name]');

  let view = 'details';
  let contact = prefill_contact || ''; // TODO: Move to store
  let email = prefill_email || ''; // TODO: Move to store

  export function showMethods() {
    view = 'methods';
  }

  function hideMethods() {
    view = 'details';
  }
</script>

<style>
  .elem-wrap {
    padding: 0 24px;
  }

  .screen-main {
    padding-top: 12px;
  }

  .partial-payment-block {
    padding: 0 12px 24px 12px;
  }

  .secured-message {
    display: flex;
    align-items: center;
    padding: 12px 0 12px 24px;
    font-size: 13px;
    color: rgba(51, 51, 51, 0.6);

    i {
      margin-right: 8px;
      position: relative;
      top: 2px;
    }
  }

  .home-methods {
    padding-left: 12px;
    padding-right: 12px;
  }

  .home-details {
    margin: 12px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .home-details :global(button) {
    padding: 12px 16px;
    line-height: 18px;
  }

  .home-details .theme-highlight-color {
    transform: rotate(180deg);
  }

  .home-details div[slot='title'] {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .home-details span:first-child {
    font-size: 15px;
    color: #363636;
  }

  .home-details span:last-child {
    font-size: 12px;
    color: #757575;
    margin-left: 8px;
    padding-left: 8px;
    border-left: solid 1px #757575;
  }
</style>

<Tab method="common" overrideMethodCheck={true} shown={true} pad={false}>
  <Screen pad={false}>
    <div slot="main" class="screen-main">
      {#if view === 'details'}
        <div transition:slide={{ duration: 400 }}>
          <div
            class="elem-wrap"
            class:invisible={contact_hidden}
            class:filled={contact.length}
            id="elem-wrap-contact">
            <Field
              id="contact"
              name="contact"
              type="tel"
              value={contact}
              required={!optional.contact}
              pattern={CONTACT_REGEX}
              readonly={contact_readonly}
              label="Phone"
              icon="&#xe607;"
              on:input={e => (contact = e.target.value)}
              helpText="Please enter a valid contact number" />
          </div>
          <div
            class="elem-wrap"
            class:invisible={email_hidden}
            class:filled={email.length}
            id="elem-wrap-email">
            <!-- TODO: add (optional) to label if email is optional -->
            <Field
              id="email"
              name="email"
              type="email"
              value={email}
              required={!optional.email}
              pattern={EMAIL_REGEX}
              readonly={email_readonly}
              label="Email"
              icon="&#xe603;"
              on:input={e => (email = e.target.value)}
              helpText="Please enter a valid email. Example: you@example.com" />
          </div>
        </div>
      {/if}

      {#if view === 'methods'}
        <div
          class="home-details border-list"
          transition:slide={{ duration: 400 }}>
          <SlottedOption on:click={hideMethods}>
            <div slot="title">
              {#if contact}
                <span>{contact}</span>
              {/if}
              {#if email}
                <span>{email}</span>
              {/if}
            </div>
            <div slot="extra" class="theme-highlight-color">&#xe604;</div>
          </SlottedOption>
        </div>

        <div
          class="home-methods"
          in:fly={{ delay: 300, duration: 400 }}
          out:fly={{ duration: 400 }}>
          <NewMethodsList />
        </div>
      {/if}

      {#if order.partial_payment}
        <div class="partial-payment-block">
          <PartialPaymentOptions />
        </div>
      {/if}
      <!-- TODO move to separate component -->
      {#if address && !order.partial_payment}
        <div class="elem-wrap" id="elem-wrap-address">
          <!-- TODO: use field -->
          <div class="elem elem-address">
            <div class="help">Address should be atleast 10 characters long</div>
            <label>Address</label>
            <textarea
              class="input"
              name="address"
              type="text"
              id="address"
              required
              pattern="[\s\S]{10}"
              maxlength="200"
              rows="2" />
          </div>
        </div>
        <div class="elem-wrap">
          <!-- TODO: use field -->
          <div class="elem">
            <div class="help">Enter 6 digit pincode</div>
            <label>PIN Code</label>
            <input
              class="input"
              required
              pattern="^\d{6}$"
              maxlength="6"
              id="pincode" />
          </div>
        </div>
        <div class="elem-wrap">
          <div class="elem select elem-state">
            <div class="help">Select a value from list of states</div>
            <i class="select-arrow">&#xe601;</i>
            <select class="input" required id="state">
              <option value="">Select State</option>
              {#each entries(session.states) as [code, text]}
                <option value={code}>{text}</option>
              {/each}
            </select>
          </div>
        </div>
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
    </div>
    <!-- TODO: move condition to computed/prop -->
    {#if session.recurring && session.tab !== 'emandate' && session.methods.count === 1 && methods.card}
      <!-- TODO: use Callout -->
      <div class="pad recurring-message">
        <span>&#x2139;</span>
        {#if o('subscription_id')}
          {#if methods.debit_card && methods.credit_card}
            Subscription payments are supported on Visa and Mastercard Credit
            Cards from all Banks and Debit Cards from ICICI, Kotak, Citibank and
            Canara Bank.
          {:else if methods.debit_card}
            Subscription payments are only supported on Visa and Mastercard
            Debit Cards from ICICI, Kotak, Citibank and Canara Bank.
          {:else}
            Subscription payments are only supported on Mastercard and Visa
            Credit Cards.
          {/if}
        {:else if methods.debit_card && methods.credit_card}
          Visa and Mastercard Credit Cards from all Banks and Debit Cards from
          ICICI, Kotak, Citibank and Canara Bank are supported for this payment.
        {:else if methods.debit_card}
          Only Visa and Mastercard Debit Cards from ICICI, Kotak, Citibank and
          Canara Bank are supported for this payment.
        {:else}
          Only Visa and Mastercard Credit Cards are supported for this payment.
        {/if}
      </div>
    {/if}
    <!-- TODO: move to separate component -->
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

    <div slot="bottom" class="secured-message">
      <i>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M12 5.33335H11.3333V4.00002C11.3333 2.16002 9.83999 0.666687
            7.99999 0.666687C6.15999 0.666687 4.66666 2.16002 4.66666
            4.00002V5.33335H3.99999C3.26666 5.33335 2.66666 5.93335 2.66666
            6.66669V13.3334C2.66666 14.0667 3.26666 14.6667 3.99999
            14.6667H12C12.7333 14.6667 13.3333 14.0667 13.3333
            13.3334V6.66669C13.3333 5.93335 12.7333 5.33335 12 5.33335ZM7.99999
            11.3334C7.26666 11.3334 6.66666 10.7334 6.66666 10C6.66666 9.26669
            7.26666 8.66669 7.99999 8.66669C8.73332 8.66669 9.33332 9.26669
            9.33332 10C9.33332 10.7334 8.73332 11.3334 7.99999 11.3334ZM6
            4V5.33334H10V4C10 2.89334 9.10666 2 8 2C6.89333 2 6 2.89334 6 4Z"
            fill="#A7A7A7" />
        </svg>
      </i>
      This payment is secured by Razorpay.
    </div>

  </Screen>
</Tab>
