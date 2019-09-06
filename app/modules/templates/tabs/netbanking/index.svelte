<!-- TODO: remove override after fixing method check -->
<Tab method="netbanking"
  pad={false}
  overrideMethodCheck
  hasMessage={selectedBankDowntime}
>
  <div ref:screenContent>
    <div id="netb-banks" class="clear grid count-3">
      {#each netbanks as { name, code }}
        <GridItem
          {name}
          {code}
          fullName={banks[code]}
          downtime={downtimes[code]}

          bind:group=selectedBankCode
        />
      {/each}
    </div>

  <div class="elem-wrap pad">
    <div id="nb-elem" class="elem select" class:invalid>
      <i class="select-arrow"></i>
      <div class="help">Please select a bank</div>
      <select
        id="bank-select"
        name="bank"
        required
        class="input no-refresh no-validate"
        pattern="[\w]+"

        bind:value=selectedBankCode

        use:focus
        use:blur
        use:input
      >
        <option value="">Select a different Bank</option>
        {#each banksArr as bank}
          <option value={bank.code}>{bank.name}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if showCorporateRadio}
    <div class="pad" ref:radioContainer transition:fade="{duration: 100}">
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

  <!-- Show recurring message for recurring payments -->
  {#if recurring}
    <Callout>
      Future payments from your bank account will be charged automatically.
    </Callout>
  {/if}

  <!-- Show downtime message if the selected bank is down -->
  {#if showDown}
    <div class="down">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" viewBox="0 0 24 24">
        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.351 6.493c-.08-.801.55-1.493 1.351-1.493s1.431.692 1.351 1.493l-.801 8.01c-.029.282-.266.497-.55.497s-.521-.215-.55-.498l-.801-8.009zm1.351 12.757c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z" />
      </svg>
      <span class="text">{banks[selectedBankCode]}</span> is currently facing issues.
    </div>
  {/if}

</Tab>

<style>

ref:radioContainer {
  margin-top: -6px;
}

.input-radio:first-of-type {
  margin-top: 4px;
}

</style>

<script>

import Razorpay from 'common/Razorpay';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import { iPhone } from 'common/useragent';

import DowntimesStore from 'checkoutstore/downtimes';
import { groupNetbankingDowntimesByBank } from 'checkoutframe/downtimes';

import * as InputActions from 'actions/input';

import {
  hasMultipleOptions,
  getRetailOption,
  getCorporateOption,
  isCorporateCode
} from 'common/bank';

import { fade } from 'lib/svelte-transitions';

export default {

  components: {
    Tab: 'templates/tabs/Tab.svelte',
    GridItem: 'templates/tabs/netbanking/GridItem.svelte',
    Callout: 'templates/views/ui/Callout.svelte'
  },

  data() {
    return {
      selectedBankCode: '',
      showCorporateRadio: false,
      corporateOption: '',
      retailOption: '',
      downtimes: {}
    }
  },

  transitions: {
    fade
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
      if (iPhone) {
        Razorpay.sendMessage({ event: 'blur' });
      }

      if (selectedBankCode) {
        Analytics.track('bank:select', {
          type: AnalyticsTypes.BEHAV,
          data: {
            bank: selectedBankCode,
          },
        });
        this.fire('bankSelected', { code: selectedBankCode });
      }
    }
  },

  oncreate() {
    const { banksArr } = this.get();


    const downtimes = DowntimesStore.get();
    const netbankingDowntimes = groupNetbankingDowntimesByBank(downtimes.netbanking);

    this.set({ downtimes: netbankingDowntimes });

    // If there is only one bank available, select it
    if (banksArr.length === 1) {
      this.setSelectedBank(banksArr[0].code);
    }


  },

  actions: {
    focus: InputActions.focus,
    blur: InputActions.blur,
    input: InputActions.input
  },

  computed: {

    showCorporateRadio: ({ selectedBankCode, banks, recurring }) =>
        !recurring && hasMultipleOptions(selectedBankCode, banks),

    corporateSelected: ({ selectedBankCode }) => isCorporateCode(selectedBankCode),

    // For eMandate, we show only the top 3 banks.
    maxGridCount: ({ recurring }) => recurring ? 3 : 6,

    banksArr: ({ banks, downtimes }) => _Obj.entries(banks)
        .map((entry) => ({ code: entry[0], name: entry[1], downtime: downtimes[entry[0]] })),

    // // Do not show invalid for emandate as the screen changes as soon as bank is selected.
    invalid: ({ method, selectedBankCode }) => !selectedBankCode,

    showDown: ({ down, selectedBankCode }) => down && down.indexOf(selectedBankCode) !== -1,

  }

}

</script>
