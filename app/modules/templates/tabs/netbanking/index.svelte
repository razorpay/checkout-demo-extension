<Tab method="netbanking" pad={false} overrideMethodCheck>

  <div id="netb-banks" class="clear grid count-3">
    {#each netbanks.slice(0, maxGridCount) as { name, code }}
      <GridItem
        {name}
        {code}

        bind:group=selectedBankCode
      />
    {/each}
  </div>

  <div class="elem-wrap pad">
    <div id="nb-elem" class="elem select invalid">
      <i class="select-arrow"></i>
      <div class="help">Please select a bank</div>
      <select id="bank-select" name="bank" required class="input" pattern="[\w]+" bind:value=selectedBankCode>
        <option selected="selected" value="">Select a different Bank</option>
        {#each allBanks as bank}
          <option value={bank.code}>{bank.name}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if showCorporateRadio}
    <div class="pad">
      <label>Complete Payment Using</label>
      <div class="input-radio">
        <input type="radio" id="nb_type_retail" value="retail" checked={!corporateSelected} on:click=setRetailOption()>
        <label for="nb_type_retail">
          <div class="radio-display"></div>
          <div class="label-content">Retail</div>
        </label>
      </div>
      <div class="input-radio">
        <input type="radio" id="nb_type_corporate" value="corporate" checked={corporateSelected} on:click=setCorporateOption()>
        <label for="nb_type_corporate">
          <div class="radio-display"></div>
          <div class="label-content">Corporate</div>
        </label>
      </div>
    </div>
  {/if}

  {#if recurring}
    <div class="pad recurring-message">
      <span>&#x2139;</span>
      Future payments from your bank account will be charged automatically.
    </div>
  {/if}

</Tab>


<script>

import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';

/**
 * Checks whether the given bank has multiple options (Corporate, Retail)
 * @param bankCode
 */
function hasMultipleOptions(bankCode, banks) {
  const normalizedBankCode = normalizeBankCode(bankCode);
  // Some retail banks have the suffix _R, while others don't. So we look for
  // codes both with and without the suffix.
  const hasRetail =
    banks[normalizedBankCode] ||
    banks[normalizedBankCode + '_R'];
  const hasCorporate = banks[normalizedBankCode + '_C'];
  return hasRetail && hasCorporate;
}

/**
 * Returns the code for retail option corresponding to `bankCode`. Looks for
 * {bankCode} and {bankCode}_R in `banks`.
 * Returns false if no option is present.
 * @param {String} bankCode
 * @param {Object} banks
 */
function getRetailOption(bankCode, banks) {
  const normalizedBankCode = normalizeBankCode(bankCode);
  const retailBankCode = normalizedBankCode + '_R';
  if (banks[normalizedBankCode]) {
    return normalizedBankCode;
  }
  return banks[retailBankCode] && retailBankCode;
}

/**
 * Returns the code for corporate option corresponding to `bankCode`. Looks for
 * {bankCode}_C in `banks`.
 * Returns false if no option is present.
 * @param {String} bankCode
 * @param {Object} banks
 */
function getCorporateOption(bankCode, banks) {
  const normalizedBankCode = normalizeBankCode(bankCode);
  const corporateBankCode = normalizedBankCode + '_C';
  return banks[corporateBankCode] && corporateBankCode;
}

/*
 * Returns a bank code with suffixes(_C, _R) removed.
 * @param {String} bankCode
 */
function normalizeBankCode(bankCode) {
  return bankCode.replace(/_[CR]$/, '');
}

/**
* Checks if the given bank code is for corporate netbanking.
*
* @param bankCode
* @return {boolean}
*/
function isCorporateCode(bankCode) {
  return /_C$/.test(bankCode);
}

// TODO check if this can be obtained from useragent.js
const ua = navigator.userAgent;
const ua_iPhone = /iPhone/.test(ua);

export default {

  components: {
    Tab: 'templates/tabs/Tab.svelte',
    GridItem: 'templates/tabs/netbanking/GridItem.svelte'
  },

  data() {
    return {
      selectedBankCode: '',
      showCorporateRadio: false,
      corporateOption: '',
      retailOption: ''
    }
  },

  methods: {
    setCorporateOption() {
      const { selectedBankCode, banks } = this.get();
      const corporateOption = getCorporateOption(selectedBankCode, banks);
      if (corporateOption) {
        this.set({ selectedBankCode: corporateOption });
      }
    },
    setRetailOption() {
      const { selectedBankCode, banks } = this.get();
      const retailOption = getRetailOption(selectedBankCode, banks);
      if (retailOption) {
        this.set({ selectedBankCode: retailOption });
      }
    },
    getSelectedBank() {
      const { selectedBankCode } = this.get();
      return selectedBankCode;
    },
    setSelectedBank(bankCode) {
      this.set({ selectedBankCode: bankCode });
    },
    deselectBank() {
      this.set({ selectedBankCode: '' });
    }
  },

  onupdate({ changed, current }) {
    if (changed.selectedBankCode) {
      const { selectedBankCode } = current;
      if (ua_iPhone) {
        Razorpay.sendMessage({ event: 'blur' });
      }
      Analytics.track('bank:select', {
        type: AnalyticsTypes.BEHAV,
        data: {
          bank: selectedBankCode,
        },
      });
      this.fire('bankSelected', { code: selectedBankCode });
    }
  },

  computed: {

    showCorporateRadio: ({ selectedBankCode, banks, recurring }) =>
        !recurring && hasMultipleOptions(selectedBankCode, banks),

    corporateSelected: ({ selectedBankCode }) => isCorporateCode(selectedBankCode),

    maxGridCount: ({ recurring }) => recurring ? 3 : 6,

    allBanks: ({ banks }) => _Obj.entries(banks).map(([code, name]) => ({ code, name })),

    // TODO: downtime ( see Session#checkDown )
  }

}

</script>
