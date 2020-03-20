import { translateExternal } from './translate';
import { getSequencedBlocks } from './sequence';
import { clusterRazorpayBlocks } from './methods';
import { ungroupInstruments, getIndividualInstruments } from './ungroup';

import { AVAILABLE_METHODS } from 'common/constants';
import {
  isMethodEnabled,
  getNetbankingBanks,
  getWallets,
  isUPIFlowEnabled,
  getPayLaterProviders,
  getCardlessEMIProviders,
} from 'checkoutstore/methods';

import { shouldSeparateDebitCard } from 'checkoutstore';
import wallet from 'ui/icons/payment-methods/wallet';

/**
 * Returns the available methods
 *
 * @returns {Array<string>}
 */
function getAvailableDefaultMethods() {
  let available = _Arr.filter(AVAILABLE_METHODS, isMethodEnabled);

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

  // Separate out debit and credit cards
  if (shouldSeparateDebitCard()) {
    available = _Arr.remove(available, 'card');
    available = ['credit_card', 'debit_card'].concat(available);
  }

  return available;
}

function isInstrumentEnabled(instrument) {
  if (!isMethodEnabled(instrument.method)) {
    return false;
  }

  switch (instrument.method) {
    case 'netbanking': {
      const hasBank = Boolean(instrument.bank);
      const banks = getNetbankingBanks();

      return hasBank ? Boolean(banks[instrument.bank]) : true;
    }

    case 'wallet': {
      const hasWallet = Boolean(instrument.wallet);
      const wallets = getWallets();
      const walletEnabled = _Arr.any(
        wallets,
        wallet => wallet.code === instrument.wallet
      );

      return hasWallet ? walletEnabled : true;
    }

    case 'cardless_emi': {
      const hasProvider = Boolean(instrument.provider);
      const providers = getCardlessEMIProviders();

      return hasProvider ? Boolean(providers[instrument.provider]) : true;
    }

    case 'paylater': {
      const hasProvider = Boolean(instrument.provider);
      const providers = getCardlessEMIProviders();
      const providerEnabled = _Arr.any(
        providers,
        provider => provider.code === instrument.provider
      );

      return hasProvider ? providerEnabled : true;
    }

    case 'upi': {
      const hasFlow = Boolean(instrument.flow);
      const flowEnabled = hasFlow ? isUPIFlowEnabled(instrument.flow) : true;

      // TODO: check for app
      return flowEnabled;
    }

    // TODO: card and EMI
  }
}

function removeDisabledInstrumentsFromBlock(block) {
  block = _Obj.clone(block);
  block.instruments = _Arr.filter(block.instruments, isInstrumentEnabled);
  return block;
}

/**
 * Creates a block config for rendering
 * @param {Object} options Options passed by the merchant
 * @param {Customer} customer
 *
 * @returns {Object}
 */
export function getBlockConfig(options, customer) {
  // Translate external representation to internal representation
  const translated = translateExternal(options);

  // Ungroup instruments and remove disabed instruments for each block
  translated.blocks =
    translated.blocks
    |> _Arr.map(block => ungroupInstruments(block, customer))
    |> _Arr.map(removeDisabledInstrumentsFromBlock);

  // Remove empty blocks
  translated.blocks = _Arr.filter(
    translated.blocks,
    block => block.instruments.length > 0
  );

  // Ungroup hidden instrument as well
  translated.hide.instruments =
    translated.hide.instruments
    |> _Arr.flatMap(
      group => getIndividualInstruments(group, customer)._ungrouped
    );

  // Reorder blocks
  const sequentialied = getSequencedBlocks({
    translated,
    original: options,
    methods: getAvailableDefaultMethods(),
  });

  // Group blocks of Razorpay
  const clustered = clusterRazorpayBlocks(sequentialied);

  return {
    blocks: clustered,
    hidden: translated.hide.instruments,
  };
}
