import { get } from 'svelte/store';
import { cardsSeparation } from 'card/experiments';
import { toTitleCase } from 'lib/utils';
import { getBanks, isDynamicFeeBearer } from 'razorpay';

import { creditCardConfig, debitCardConfig } from './constants';
import { isMethodEnabled } from 'checkoutstore/methods';
import { getMaxPreferredMethods } from 'checkoutframe/personalization/index';

import { Events, HomeEvents } from 'analytics';

import { blocks } from 'checkoutstore/screens/home';

// i18n
import { getLongBankName, formatTemplateWithLocale } from 'i18n';
// Dynamic Fee Bearer
import { setDynamicFeeObject } from 'checkoutstore/dynamicfee';
import { getTranslatedMethodPrefix } from 'checkoutframe/paymentmethods';
import { generateTextFromList } from 'i18n/text-utils';
import { SINGLE_BLOCK_TITLE } from 'ui/labels/methods';

import { getUPIAppDataFromHandle } from 'common/upi';
import { isSavedCardInstrument } from 'configurability/instruments';

function getSplitConfig() {
  const config = [];
  if (isMethodEnabled('debit_card')) {
    config.push(debitCardConfig);
  }
  if (isMethodEnabled('credit_card')) {
    config.push(creditCardConfig);
  }
  return config;
}

/**
 *
 * @param {block[]} allBlocks
 * This method updates the blocks as per the experiments running
 * This method works on pass-by-reference
 */
export function updateBlocksForExperiments(allBlocks) {
  if (cardsSeparation.enabled() && isMethodEnabled('card')) {
    for (const blockKey in allBlocks) {
      const { code, instruments } = allBlocks[blockKey];
      if (code === 'rzp.cluster') {
        const cardInstrumentIndex = instruments?.findIndex(
          (instrument) => instrument?.code === 'card'
        );
        if (cardInstrumentIndex > -1) {
          instruments.splice(cardInstrumentIndex, 1, ...getSplitConfig());
        }
      }
    }
  }
}

export function getAvailableMethods() {
  return get(blocks).reduce(
    (methods, block) =>
      methods.concat(block.instruments.map((instrument) => instrument.method)),
    []
  );
}

export function getSectionsDisplayed(blocks) {
  return blocks.reduce(
    (sections, block) => [...sections, getSectionCategoryForBlock(block)],
    []
  );
}

export function getSectionCategoryForBlock(block) {
  let section = 'custom';
  if (block.code === 'rzp.preferred') {
    section = 'p13n';
  } else if (block.code === 'rzp.cluster') {
    section = 'generic';
  }
  return section;
}

export function setDynamicFees(instrument, forType) {
  if (isDynamicFeeBearer()) {
    if (forType === 'rzpCluster') {
      let types = ['debit_card', 'credit_card'];

      let inst = types.includes(instrument?.method)
        ? 'card'
        : instrument?.method;
      if (inst !== 'card') {
        return setDynamicFeeObject(inst);
      }
    }
    if (forType === 'newList') {
      let method = instrument?.method;
      if (method !== 'card') {
        return setDynamicFeeObject(method);
      }
    }
  }
}

/**
 * This method is a decoupled method from p13n block saved card.
 * This is done to utilize the same logic for cards=>saved-cards view.
 * @param {Card} card card with issuer, network and last4
 * @param {Boolean} loggedIn User login status
 * @param {Boolean} isEmiInstrument if instrument method is EMI or not
 * @param {*} locale i18n locale
 * @returns `Issuer Type card - last4` ex:Axis Debit card - 7369
 */
export function getBankText(card, loggedIn, isEmiInstrument, locale) {
  const banks = getBanks() || {};

  const bank = banks[card.issuer] ? getLongBankName(card.issuer, locale) : '';

  const bankText = bank.replace(/ Bank$/, '');

  const cardType = card.type || '';

  if (loggedIn) {
    return formatTemplateWithLocale(
      isEmiInstrument
        ? 'instruments.titles.emi_logged_in'
        : 'instruments.titles.card_logged_in',
      {
        bank: bankText,
        type: toTitleCase(cardType),
        last4: card.last4,
      },
      locale
    );
  }
  return formatTemplateWithLocale(
    isEmiInstrument
      ? 'instruments.titles.emi_logged_out'
      : 'instruments.titles.card_logged_out',
    {
      bank: bankText,
      type: toTitleCase(cardType),
    },
    locale
  );
}

/**
 * Since p13n call only gives token in response and all other details like issuer etc are mapped internally to present them in p13n block
 * Only instrument will be available (with limited params) in session submit and mapping token with consent details in session becomes costly.
 * This method is a similar workaround but for storing consent related info on instrument,
 * Note: This is a pass-by-reference and affects the reference.
 * @param {*} instrument instrument from the p13n block/from any other area
 * @param {*} card saved card object with consent details in it
 */
export const addConsentDetailsToInstrument = (instrument, card) => {
  instrument.consent_taken = card.consent_taken;
};

/**
 * @param  {array} instruments - array of methods present in a generic section
 * @param  {string} locale
 *
 * returns the name of the block on the basis of intruments method preent in instruments
 */
export function getBlockTitle(instruments, locale) {
  try {
    const methods = instruments.map((instrument) => instrument.method);

    const blockNames = methods.map((method) =>
      getTranslatedMethodPrefix(method, locale)
    );

    /**
     * For just one method, use SINGLE_BLOCK_TITLE
     * For more, use generateTextFromList
     */
    if (blockNames.length === 1) {
      return formatTemplateWithLocale(
        SINGLE_BLOCK_TITLE, // LABEL: Pay via {method}
        { method: blockNames[0] },
        locale
      );
    }

    return generateTextFromList(blockNames, locale, 3);
  } catch {
    return '';
  }
}

/**
 * @param  {Object} instrument
 * returns the name of upi instrument
 */
function getUpiName(instrument) {
  switch (instrument.flows[0]) {
    case 'collect': {
      return (
        getUPIAppDataFromHandle(instrument?.vpas?.[0]?.split('@')[1])
          .app_name || ''
      );
    }

    case 'intent': {
      return (
        getUPIAppDataFromHandle(instrument?.vendor_vpa?.split('@')[1])
          .app_name || ''
      );
    }

    case 'qr': {
      return 'qr';
    }
  }
}
/**
 * @param  {Object} instrument
 * * returns instrument data for instrument:selected event
 */
export function getInstrumentDetails(instrument) {
  try {
    const personalisation = !!instrument.meta?.preferred;
    switch (instrument.method) {
      case 'netbanking': {
        return {
          name: instrument.banks?.[0],
          saved: false,
          personalisation,
        };
      }

      case 'upi': {
        /* 
          When UPI method has this keys ['flows', 'apps', 'token_id', 'vpas']
          then it considered as UPI Instrument if it contains `apps`
          we are setting type as intent and adding app name also for respective Instument event
        */
        if (instrument.apps?.[0]) {
          return {
            name: instrument.apps[0],
            saved: false,
            personalisation,
            type: 'intent',
          };
        }
        const vpa = instrument?.vpas?.[0] || instrument?.vendor_vpa || '';
        return {
          name: getUpiName(instrument),
          saved: !!instrument.vpas && !!instrument.vpas[0],
          personalisation,
          type:
            instrument?.flows?.[0] === 'qr'
              ? 'intent'
              : instrument.flows?.[0] || '',
          vpa: vpa ? `@${vpa.split('@')[1]}` : '',
        };
      }

      case 'wallet': {
        return {
          name: instrument.wallets?.[0],
          saved: false,
          personalisation,
        };
      }

      case 'card': {
        return {
          issuer: instrument.issuers?.[0],
          saved: !!isSavedCardInstrument(instrument),
          personalisation,
          type: instrument.types?.[0],
          network: instrument.networks?.[0],
        };
      }

      case 'cardless_emi': {
        return {
          name: instrument.providers?.[0],
          personalisation,
        };
      }

      default: {
        return {
          saved: false,
          personalisation,
        };
      }
    }
  } catch {
    return { saved: false, personalisation: false };
  }
}
//this function tracks event when paypal is shown to the user under preferred methods,
//function is being called in home/index.svelte
export const trackPaypalRendered = (instruments) => {
  try {
    if (Array.isArray(instruments)) {
      const isRendered = instruments.some(
        (instrument, index) =>
          instrument?.wallets?.includes('paypal') &&
          index < getMaxPreferredMethods()
      );
      if (isRendered) {
        Events.TrackRender(HomeEvents.PAYPAL_RENDERED);
      }
    }
  } catch (e) {}
};
