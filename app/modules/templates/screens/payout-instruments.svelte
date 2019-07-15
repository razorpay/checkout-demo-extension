<div id="form-payouts" class="tab-content showable screen">

<div class="title">
  <h3>Select an account</h3>
  <p>{amount} will be credited to your specified account.</p>
</div>

{#if upiAccountsAvailable}
<div class="instrument-group">
  <div class="instrument-header">
    <div class="icon icon-left">
      <svg viewBox="0 0 21 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.516 20.254l9.15-8.388-6.1-8.388-1.185 6.516 1.629 2.042-2.359 1.974-1.135 6.244zM12.809.412l8 11a1 1 0 0 1-.133 1.325l-12 11c-.707.648-1.831.027-1.66-.916l1.42-7.805 3.547-3.01-1.986-5.579 1.02-5.606c.157-.865 1.274-1.12 1.792-.41z" fill="rgba(83, 95, 218, 1)"></path>
        <path d="M5.566 3.479l-3.05 16.775 9.147-8.388-6.097-8.387zM5.809.412l7.997 11a1 1 0 0 1-.133 1.325l-11.997 11c-.706.648-1.831.027-1.66-.916l4-22C4.174-.044 5.292-.299 5.81.412z" fill="rgba(46, 53, 121, 1)"></path>
      </svg>
    </div>
    <span class="header-text">
      Select a UPI ID
    </span>
  </div>
  <div class="options">
    {#each upiAccounts as account}
      <RadioOption data="{account}" selected="{selectedInstrument && selectedInstrument.fund_account_id === account.fund_account_id}" on:select="select(account)" reverse name="instrument" value="account.fund_account_id">
        <div class="instrument-name">{account.vpa.address}</div>
      </RadioOption>
    {/each}
  </div>
  <div class="instrument-add" on:click="fire('addUpi')">
    <div class="icon icon-left"></div>
    Add UPI ID
  </div>
</div>
{/if}

{#if bankAccountsAvailable}
<div class="instrument-group">
  <div class="instrument-header">
    <div class="icon icon-left">
      <svg viewBox="0 0 28 25" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 15a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0v-5zm6 0a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0v-5zm6 0a1 1 0 0 1 2 0v5a1 1 0 0 1-2 0v-5zM1 25a1 1 0 0 1 0-2h20a1 1 0 0 1 0 2H1zm0-13c-.978 0-1.374-1.259-.573-1.82l10-7a1 1 0 0 1 1.146 0l1.426 1L13 9l1 3H1zm3.172-2h8.814l.017-3.378L11 5.221 4.172 10z" fill="rgba(46, 53, 121, 1)"></path>
        <path d="M20 16a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm3.663-7H27v2h-3.338c-.162 2.156-.85 4.275-2.057 6.352l-1.21-.704c1.084-1.863 1.703-3.744 1.863-5.648H13V7h9.258c-.16-1.904-.78-3.785-1.863-5.648l1.21-.704C22.814 2.725 23.501 4.844 23.663 7zm-4.058 7.648l-1.21.704C17 12.955 16.3 10.502 16.3 8c0-2.501.701-4.955 2.095-7.352l1.21.704C18.332 3.54 17.7 5.754 17.7 8c0 2.246.632 4.46 1.905 6.648z" fill="rgba(83, 95, 218, 1)"></path>
      </svg>
    </div>
    <span class="header-text">
      Select a Bank Account
    </span>
  </div>
  <div class="options">
    {#each bankAccounts as account}
      <RadioOption data="{account}" selected="{selectedInstrument && selectedInstrument.fund_account_id === account.fund_account_id}" on:select="select(account)" reverse name="instrument" value="account.fund_account_id">
        <div class="instrument-name">A/c No. {account.bank_account.account_number}</div>
        <div class="instrument-info">IFSC: {account.bank_account.ifsc}, {account.bank_account.name}</div>
      </RadioOption>
    {/each}
  </div>
  <div class="instrument-add" on:click="fire('addBank')">
    <div class="icon icon-left">+</div>
    Add bank account
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
    on:select="fire('addUpi')"
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
    on:select="fire('addBank')"
    >
    <div>BANK</div>
    <div class="desc">Add a Bank Account</div>
  </NextOption>

</div>
{/if}

</div>

<style>

#form-payouts {
  overflow: auto;
  top: 0;
}

.instrument-group {
  font-size: 13px;
}

.instrument-group {
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.1);
  margin: 12px;
}

.instrument-header, .instrument-add {
  padding: 12px 60px 12px 40px;
  position: relative;
}

.instrument-header {
  border: 1px solid #e6e7e8;
  position: relative;
  padding-top: 16px;
  padding-bottom: 16px;
}

.instrument-add {
  border: 1px solid #e6e7e8;
  border-top: none;
}

.icon.icon-left {
  position: absolute;
  left: 12px;
  top: 12px;
}

.instrument-header .header-text {
  padding-top: 4px;
  text-transform: uppercase;
}

.instrument, .instrument-add {
  border-top: 1px solid #e6e7e8;
  cursor: pointer;
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
}

.add-option {
  margin: 16px;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.1);
}

.desc {
  font-size: 12px;
  color: #999;
}

</style>

<script>

export default {

  components: {
    NextOption: 'templates/views/ui/options/NextOption.svelte',
    RadioOption: 'templates/views/ui/options/RadioOption.svelte'
  },

  data() {
    return {
      selectedInstrument: null
    };
  },

  methods: {
    select(instrument) {
      this.set({ selectedInstrument: instrument });
      this.fire('accountSelected', instrument);
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
