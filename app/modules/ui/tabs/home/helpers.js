import { get } from 'svelte/store';
import { cardsSeparation } from 'card/experiments';
import { toTitleCase } from 'lib/utils';
import { getBanks, isDynamicFeeBearer } from 'razorpay';

import { creditCardConfig, debitCardConfig } from './constants';
import { isMethodEnabled } from 'checkoutstore/methods';

import { blocks } from 'checkoutstore/screens/home';

// i18n
import { getLongBankName, formatTemplateWithLocale } from 'i18n';
// Dynamic Fee Bearer
import { setDynamicFeeObject } from 'checkoutstore/dynamicfee';

function getSplitConfig() {
  const config = [];
  if (isMethodEnabled('debit_card')) config.push(debitCardConfig);
  if (isMethodEnabled('credit_card')) config.push(creditCardConfig);
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
      let type =
        instrument?.method === 'debit_card'
          ? 'debit'
          : instrument?.method === 'credit_card'
          ? 'credit'
          : '';
      if (inst !== 'card') {
        return setDynamicFeeObject(inst);
      }
    }
    if (forType === 'newList') {
      let method = instrument?.method;
      let type = instrument?.types?.[0] || '';
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
  } else {
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
