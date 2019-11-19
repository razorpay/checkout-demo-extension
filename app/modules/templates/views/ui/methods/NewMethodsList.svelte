<script>
  // UI imports
  import Method from 'templates/views/ui/methods/Method.svelte';
  import CardInstrument from 'templates/views/ui/Personalization/CardInstrument.svelte';
  import Instrument from 'templates/views/ui/Personalization/Instrument.svelte';

  import { AVAILABLE_METHODS } from 'common/constants';
  import { getSession } from 'sessionmanager';
  import { isMobile } from 'common/useragent';
  import { doesAppExist } from 'common/upi';
  import Analytics from 'analytics';
  import * as AnalyticsTypes from 'analytics-types';

  const session = getSession();
  let visibleMethods = [];
  let visibleInstruments = [];

  function filterMethods(methods) {
    return _Arr.filter(AVAILABLE_METHODS, method => {
      return _.isArray(methods[method])
        ? Boolean(methods[method].length)
        : methods[method];
    });
  }

  function setMethods(methods) {
    let available = filterMethods(methods);

    /**
     * Cardless EMI and EMI are the same payment option.
     * When we click EMI, it should take to Cardless EMI if
     * cardless_emi is an available method.
     */
    if (
      _Arr.contains(available, 'cardless_emi') &&
      _Arr.contains(available, 'emi')
    ) {
      available = _Arr.remove(available, 'emi');
    }

    /**
     * We do not want to show QR in the primary list
     * of payment options anymore
     */
    available = _Arr.remove(available, 'qr');

    // TODO: Filter based on amount

    visibleMethods = available;
  }

  function setInstruments() {
    let instruments = [
      {
        wallet: 'freecharge',
        method: 'wallet',
        timestamp: 1566990934739,
        success: false,
        frequency: 4,
        id: 'BXFgSdmlXqscTs',
      },
      {
        method: 'card',
        token_id: 'token_9AT28Pxxe0Npi9',
        type: 'credit',
        issuer: 'ICIC',
        network: 'MasterCard',
        timestamp: 1571742071478,
        success: true,
        frequency: 58,
        id: 'BYn4088DoGT4ND',
      },
      {
        method: 'card',
        token_id: 'token_69ATx28Pxxe0Npi9',
        type: 'credit',
        issuer: 'ICIC',
        network: 'RuPay',
        timestamp: 1571742071478,
        success: true,
        frequency: 58,
        id: '6BYn4088xDoGT4ND',
      },
      {
        method: 'card',
        token_id: 'token_59ATx28Pxxe0Npi9',
        type: 'credit',
        issuer: 'ICIC',
        network: 'American Express',
        timestamp: 1571742071478,
        success: true,
        frequency: 58,
        id: '5BYn4088xDoGT4ND',
      },
      {
        method: 'card',
        token_id: 'token_49ATx28Pxxe0Npi9',
        type: 'credit',
        issuer: 'ICIC',
        network: 'Diners Club',
        timestamp: 1571742071478,
        success: true,
        frequency: 58,
        id: '4BYn4088xDoGT4ND',
      },
      {
        method: 'card',
        token_id: 'token_39ATx28Pxxe0Npi9',
        type: 'credit',
        issuer: 'ICIC',
        network: 'Visa',
        timestamp: 1571742071478,
        success: true,
        frequency: 58,
        id: '3BYn4088xDoGT4ND',
      },
      {
        method: 'card',
        token_id: 'token_29ATx28Pxxe0Npi9',
        type: 'credit',
        issuer: 'ICIC',
        network: 'Bajaj Finserv',
        timestamp: 1571742071478,
        success: true,
        frequency: 58,
        id: '2BYn4088xDoGT4ND',
      },
      {
        method: 'card',
        token_id: 'token_19ATx28Pxxe0Npi9',
        type: 'credit',
        issuer: 'ICIC',
        network: 'unknown',
        timestamp: 1571742071478,
        success: true,
        frequency: 58,
        id: '1BYn4088xDoGT4ND',
      },
      {
        '_[flow]': 'intent',
        '_[upiqr]': '1',
        method: 'upi',
        timestamp: 1573540387023,
        success: true,
        frequency: 25,
        id: 'CzrbrLSryKJRqT',
      },
      {
        bank: 'KKBK',
        method: 'netbanking',
        timestamp: 1564737032060,
        success: false,
        frequency: 3,
        id: 'D0HgIpdHcGaJZH',
      },
      {
        bank: 'HDFC',
        method: 'netbanking',
        timestamp: 1567500711224,
        success: false,
        frequency: 6,
        id: 'D0HgiQA7UG5Ykd',
      },
      {
        '_[flow]': 'directpay',
        vpa: 'umanghome123@ybl',
        method: 'upi',
        timestamp: 1564646237158,
        success: false,
        frequency: 2,
        id: 'D0apTaxfmKwEkz',
      },
      {
        bank: 'ALLA',
        method: 'netbanking',
        timestamp: 1564735856210,
        success: false,
        frequency: 1,
        id: 'D10HRixVyoaFuI',
      },
      // {
      //   "_[flow]": "intent",
      //   "method": "upi",
      //   "timestamp": 1567088580069,
      //   "success": false,
      //   "frequency": 2,
      //   "id": "DBmM8zc92WEfer"
      // },
      {
        '_[flow]': 'directpay',
        vpa: 'umanghome@okicici',
        method: 'upi',
        timestamp: 1567690358160,
        success: false,
        frequency: 4,
        id: 'DBmMbrqGe096p7',
      },
      {
        bank: 'PMCB',
        method: 'netbanking',
        timestamp: 1568021807837,
        success: false,
        frequency: 1,
        id: 'DG3MT1zKlc2Zu1',
      },
      {
        '_[flow]': 'directpay',
        vpa: 'umangrajeshgalaiya@icici',
        method: 'upi',
        timestamp: 1568712465764,
        success: false,
        frequency: 1,
        id: 'DJDTt4vN1krVBx',
      },
    ];
    // TODO
    // let instruments = getInstrumentsForCustomer(customer, {
    //   methods: session.methods
    // });

    // TODO: Move this to p13n filters
    /* Filter out any app that's in user's list but not currently installed */
    instruments = _Arr.filter(instruments, instrument => {
      if (instrument.method === 'upi' && instrument['_[flow]'] === 'intent') {
        if (instrument['_[upiqr]'] === '1' && !isMobile()) {
          return true;
        }

        if (doesAppExist(instrument.upi_app, session.upi_intents_data)) {
          return true;
        }

        return false;
      }

      return true;
    });

    visibleInstruments = instruments.slice(0, 3);

    if (selectedInstrumentId) {
      const selected = _Arr.find(
        visibleInstruments,
        instrument => instrument.id === selectedInstrumentId
      );

      if (!selected) {
        deselectInstrument();
      }
    }
  }

  let selectedInstrumentId;

  function selectP13nInstrument(instrument) {
    selectedInstrumentId = instrument.id;
  }

  function deselectInstrument() {
    selectedInstrumentId = null;
  }

  setMethods(session.methods);
  setInstruments();

  function selectMethod(event) {
    Analytics.track('p13:method:select', {
      type: AnalyticsTypes.BEHAV,
      data: event.detail,
    });

    const { down, method } = event.detail;

    if (down) {
      return;
    }

    session.switchTab(method);
  }
</script>

<style>
  .border-list {
    margin-bottom: 24px;
  }
</style>

<div class="border-list">
  {#each visibleInstruments as instrument, index (instrument.id)}
    {#if instrument.method === 'card'}
      <CardInstrument
        name="p13n"
        {instrument}
        selected={instrument.id === selectedInstrumentId}
        on:click={() => selectP13nInstrument(instrument)} />
    {:else}
      <Instrument
        name="p13n"
        {instrument}
        selected={instrument.id === selectedInstrumentId}
        on:click={() => selectP13nInstrument(instrument)} />
    {/if}
  {/each}
</div>

<div class="methods-container border-list">
  {#each visibleMethods as method}
    <Method {method} on:select={selectMethod} />
  {/each}
</div>
