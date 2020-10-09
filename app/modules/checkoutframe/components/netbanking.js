import { getMerchantMethods, getOption } from 'checkoutstore';
import {
  isMethodEnabled,
  isEMandateEnabled,
  getEMandateBanks,
} from 'checkoutstore/methods';
import { selectedBank } from 'checkoutstore/screens/netbanking';
import { getSession } from 'sessionmanager';
import { setView, destroyView } from './';
import NetbankingTab from 'ui/tabs/netbanking/index.svelte';

const NETBANKING_KEY = 'netbankingTab';

function render() {
  const prefilledBank = getOption('prefill.bank');
  var method, banks;

  if (isEMandateEnabled()) {
    method = 'emandate';
    banks =
      getEMandateBanks()
      |> _Obj.reduce((banks, bank, code) => {
        banks[code] = bank.name;
        return banks;
      }, {});
  } else if (isMethodEnabled('netbanking')) {
    method = 'netbanking';
    banks = getMerchantMethods().netbanking;
  }

  if (method) {
    const netbankingTab = new NetbankingTab({
      target: _Doc.querySelector('#form-fields'),
      props: {
        bankOptions: getOption('method.netbanking'),
        banks: banks,
        method: method,
      },
    });

    const session = getSession();

    // Add listener for proceeding automatically only if emandate
    // TODO session dependency - session.switchTab
    if (method === 'emandate') {
      netbankingTab.$on(
        'bankSelected',
        session.proceedAutomaticallyAfterSelectingBank.bind(session)
      );
    }

    // TODO session dependency - move session.offers to es6components
    netbankingTab.$on('bankSelected', e => {
      session.validateOffers(e.detail.bank.code, offerRemoved => {
        if (!offerRemoved) {
          // If the offer was not removed, revert to the bank in offer issuer
          selectedBank.set(session.getAppliedOffer().issuer);
        }
      });
    });

    setView(NETBANKING_KEY, netbankingTab);
  }
}

function destroy() {
  destroyView(NETBANKING_KEY);
}

export default {
  render,
  destroy,
};
