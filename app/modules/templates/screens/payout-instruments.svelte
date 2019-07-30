<Tab method="payouts" overrideMethodCheck="{true}" pad="{false}">

<div class="title">
  <h3>Select an account</h3>
  <p>{amount} will be credited to your specified account.</p>
</div>

{#if upiAccountsAvailable}
<div class="instrument-group">
  <div class="instrument-header">
    <div class="icon-left">
      <Icon icon="{session.themeMeta.icons['upi']}" />
    </div>
    <span class="header-text">
      Select a UPI ID
    </span>
  </div>
  <div class="options">
    {#each upiAccounts as account (account.id)}
      <PayoutInstrument
        {account}
        selected="{selectedInstrument && selectedInstrument.id === account.id}"

        on:select="select(account)"
      >
        <div class="instrument-name">{account.vpa.address}</div>
      </PayoutInstrument>
    {/each}
    <div class="instrument-add option next-option secondary-color" on:click="fire('add', { method: 'upi' })">
      <div class="icon icon-left icon-add">+</div>
      Add UPI ID
    </div>
  </div>
</div>
{/if}

{#if bankAccountsAvailable}
<div class="instrument-group">
  <div class="instrument-header">
    <div class="icon-left" ref:nbIcon >
      <Icon icon="{session.themeMeta.icons['netbanking']}" />
    </div>
    <span class="header-text">
      Select a Bank Account
    </span>
  </div>
  <div class="options">
    {#each bankAccounts as account (account.id)}
      <PayoutInstrument
        {account}
        selected="{selectedInstrument && selectedInstrument.id === account.id}"

        on:select="select(account)"
      >
        <div class="instrument-name">A/c No. {account.bank_account.account_number}</div>
        <div class="instrument-info">IFSC: {account.bank_account.ifsc}, {account.bank_account.name}</div>
      </PayoutInstrument>
    {/each}
    <div class="instrument-add option next-option secondary-color" on:click="fire('add', { method: 'bank' })">
      <div class="icon icon-left icon-add">+</div>
      Add Bank Account
    </div>
  </div>

</div>
{/if}

{#if !upiAccountsAvailable}
<div class="options add-option">

  <NextOption
    icon="{session.themeMeta.icons.upi}"
    tabindex="0"
    attributes={{
      role: 'button',
      'aria-label': 'Add a UPI ID'
    }}
    classes={['secondary-color']}

    on:select="fire('add', { method: 'upi' })"
  >
    <div>UPI</div>
    <div class="desc">Add a UPI ID (BHIM, PhonePe and more)</div>
  </NextOption>

</div>
{/if}

{#if !bankAccountsAvailable}
<div class="options add-option">

  <NextOption
    icon="{session.themeMeta.icons.netbanking}"
    tabindex="0"
    attributes={{
      role: 'button',
      'aria-label': 'Add a UPI ID'
    }}
    classes={['secondary-color']}

    on:select="fire('add', { method: 'bank' })"
    >
    <div>BANK</div>
    <div class="desc">Add a Bank Account</div>
  </NextOption>

</div>
{/if}

</Tab>

<style>

:global(#form-payouts) {
  overflow: auto;
  top: 0;
}

.instrument-group {
  font-size: 13px;
}

.instrument-group {
  box-shadow: 0 2px 4px rgba(61, 64, 72, 0.06);
  margin: 12px;
}

.instrument-header, .instrument-add {
  padding: 14px 60px 16px 40px;
  position: relative;
}

.instrument-header {
  border: 1px solid #e6e7e8;
  border-bottom: none;
  position: relative;
}

.instrument-add {
  border: 1px solid #e6e7e8;
  padding: 12px 60px 14px 40px !important;
}

.icon-left {
  position: absolute;
  left: 12px;
  top: 12px;
  width: 18px;
  height: auto;
}

ref:nbIcon {
  left: 14px;
  transform: scale(1.1);
  top: 14px;
}

.icon.icon-add {
  font-size: 20px;
  left: 18px;
  top: 10px;
}

.instrument-header .header-text {
  text-transform: uppercase;
  color: #072654;
}

.instrument-add {
  cursor: pointer;
  color: #072654;
}

.instrument-info {
  color: #999;
  font-size: 12px;
}

.instrument-add:after {
  content: '\e604';
  font-size: 10px;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%) rotate(180deg);
  margin-top: .2em;
}

.icon svg {
  height: 20px;
  max-width: 20px;
}

.title {
  padding: 14px 14px 0 14px;
}

h3 {
  margin: 0;
  font-weight: bold;
  color: #000;
  font-size: 14px;
  line-height: 15px;
  text-transform: unset;
}

p {
  font-size: 12px;
  margin-top: 8px;
  font-weight: 100;
  color: #999;
}

.options {
  margin: 0;
  max-height: unset;
}

.add-option {
  margin: 16px;
  box-shadow: 0 2px 4px rgba(61, 64, 72, 0.06);
}

.desc {
  font-size: 12px;
  color: #999;
}

</style>

<script>

export default {

  components: {
    Icon: 'templates/views/ui/Icon.svelte',
    NextOption: 'templates/views/ui/options/NextOption.svelte',
    PayoutInstrument: 'templates/views/ui/PayoutInstrument.svelte',
    Tab: 'templates/tabs/Tab.svelte',
  },

  data() {
    return {
      selectedInstrument: null
    };
  },

  methods: {
    select(instrument) {
      this.set({ selectedInstrument: instrument });
      this.fire('selectaccount', instrument);
    },
    getSelectedInstrument() {
      const { selectedInstrument } = this.get();
      return selectedInstrument;
    }
  },

  computed: {
    upiAccountsAvailable: ({ upiAccounts }) => upiAccounts && upiAccounts.length > 0,
    bankAccountsAvailable: ({ bankAccounts }) => bankAccounts && bankAccounts.length > 0
  }

}

</script>
