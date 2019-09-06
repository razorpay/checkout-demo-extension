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
      <div class="pad"
        ref:radioContainer
        transition:fade="{duration: 100}"
        class:scrollFix=selectedBankDowntime
      >
        <label>Complete Payment Using</label>
        <div class="input-radio">
          <input
            type="radio"
            id="nb_type_retail"
            value="retail"
            checked={!corporateSelected}
            on:click=setRetailOption()
          >
          <label for="nb_type_retail">
            <div class="radio-display"></div>
            <div class="label-content">Retail</div>
          </label>
        </div>
        <div class="input-radio">
          <input
            type="radio"
            id="nb_type_corporate"
            value="corporate"
            checked={corporateSelected}
            on:click=setCorporateOption()
          >
          <label for="nb_type_corporate">
            <div class="radio-display"></div>
            <div class="label-content">Corporate</div>
          </label>
        </div>
      </div>
    {/if}
  </div>

  <!-- Show recurring message for recurring payments -->
  {#if recurring}
    <Callout>
      Future payments from your bank account will be charged automatically.
    </Callout>
  {/if}

  <!-- Show downtime message if the selected bank is down -->
  {#if selectedBankDowntime}
    <Downtime
      issuer={banks[selectedBankCode]}
      isHighSeverity={isHighSeverityDowntime}
    />
  {/if}

</Tab>

<style>

#netb-banks {
  overflow: hidden;
}

ref:screenContent {
  height: 100%;
  overflow: auto;
}

ref:radioContainer {
  margin-top: -6px;
  margin-bottom: 18px;
}

/* Add extra space at the bottom to prevent callout message from overlapping radios */
ref:radioContainer.scrollFix {
  margin-bottom: 36px;
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

import { getPreferredBanks } from 'common/bank';
import { getSession } from 'sessionmanager';

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
    Callout: 'templates/views/ui/Callout.svelte',
    Downtime: 'templates/views/ui/Downtime.svelte'
  },

  data() {
    return {
      selectedBankCode: '',
      showCorporateRadio: false,
      corporateOption: '',
      retailOption: '',
      downtimes: {},
      session: getSession()
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
    onSwitch() {
      this.hidePayButtonIfSevereDowntime();
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
    },
    hidePayButtonIfSevereDowntime() {
      const { isHighSeverityDowntime, session } = this.get();
      session.body.toggleClass('sub', !isHighSeverityDowntime);
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
        this.hidePayButtonIfSevereDowntime();
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

    // Do not show invalid for emandate as the screen changes as soon as bank is selected. // TODO: Fix this
    invalid: ({ method, selectedBankCode }) => method !== 'emandate' && !selectedBankCode,

    showDown: ({ down, selectedBankCode }) => down && down.indexOf(selectedBankCode) !== -1,

    selectedBankDowntime: ({ downtimes, selectedBankCode }) => downtimes && downtimes[selectedBankCode],

    netbanks: ({ banks, bankOptions, maxGridCount }) => getPreferredBanks(banks, bankOptions).slice(0, maxGridCount),

    // Hide pay button only if the selected bank's downtime severity is high or scheduled.
    // TODO: figure out a better way of doing this. (i.e. return computed object from downtime module)
    isHighSeverityDowntime: ({ selectedBankDowntime }) => selectedBankDowntime
         && _Arr.contains(['high', 'scheduled'], selectedBankDowntime.severity)

  }

}

</script>
