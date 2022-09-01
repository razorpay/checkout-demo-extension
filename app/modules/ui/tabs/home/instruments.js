import { createBlock } from 'configurability/blocks';
import {
  blocks,
  instruments,
  sequence,
  hiddenMethods,
  hiddenInstruments,
} from 'checkoutstore/screens/home';
import { getSession } from 'sessionmanager';
import { updateBlocksForExperiments } from './helpers';
import { get as storeGetter } from 'svelte/store';
import { getBlockConfig } from 'configurability';
import { isInstrumentForEntireMethod } from 'configurability/instruments';
import { getIndividualInstruments } from 'configurability/ungroup';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import { hashFnv32a } from 'checkoutframe/personalization/utils';
import { isMethodUsable } from 'checkoutstore/methods';
import { getDowntimes, checkDowntime } from 'checkoutframe/downtimes';
import { getAppFromPackageName } from 'common/upi';
import { getMaxPreferredMethods } from 'checkoutframe/personalization/index';
import * as ObjectUtils from 'utils/object';
import { getMerchantConfig } from 'checkoutstore';
import { customer } from 'checkoutstore/customer';

function generateBasePreferredBlock(preferred) {
  const preferredBlock = createBlock('rzp.preferred', {
    name: 'Preferred Payment Methods',
  });

  preferredBlock.instruments = preferred;

  return preferredBlock;
}

/**
 * Tells whether a p13n instrument is hidden using config.
 *
 * @param {Instrument} instrument
 * @param {Array<Instrument>} hiddenInstruments
 * @param {Customer} customer
 * @returns {boolean}
 */
function isP13nInstrumentHiddenViaConfig(
  instrument,
  hiddenInstruments,
  customer
) {
  const individualInstruments = getIndividualInstruments(
    instrument,
    customer
  )._ungrouped;

  // For every individual p13n instrument, check if any hidden
  // instruments are present.
  return !individualInstruments.every(
    (individualInstrument) =>
      !hiddenInstruments.some((hiddenInstrument) =>
        areInstrumentsSame(hiddenInstrument, individualInstrument)
      )
  );
}

/**
 * Compares two instruments and tells whether they are
 * the same instrument or not. This only works on ungrouped
 * instruments.
 *
 * @param {Instrument} instrument1
 * @param {Instrument} instrument2
 * @returns {boolean}
 */
function areInstrumentsSame(instrument1, instrument2) {
  const comparator =
    INSTRUMENT_COMPARATORS[instrument1.method] || genericInstrumentComparator;

  return (
    instrument1.method === instrument2.method &&
    comparator(instrument1, instrument2)
  );
}

const INSTRUMENT_COMPARATORS = {
  netbanking: (a, b) => a.bank === b.bank,
};

function genericInstrumentComparator() {
  return false;
}

/**
 * Tells whether a given preferred instrument is allowed
 * Used to filter out preferred methods instruments.
 * @param {Instrument} preferred
 * @param {Array<Instrument>} instruments
 *
 * @returns {boolean}
 */
function shouldAllowPreferredInstrument(preferred, instruments) {
  return instruments.every((instrument) => {
    if (preferred.method !== instrument.method) {
      return true;
    }

    // If entire method is asked to be shown, we can show the preferred instrument too
    if (isInstrumentForEntireMethod(instrument)) {
      return true;
    }

    const hasOnlyOneUngrouped = instrument._ungrouped.length === 1;

    // If there's only one ungrouped instrument, it shows up as a radio. Always allow for non-radio i.e. multiple ungrouped
    if (!hasOnlyOneUngrouped) {
      return true;
    }

    switch (preferred.method) {
      case 'netbanking': {
        const hasBanks = Boolean(instrument.banks);

        // Does the instrument ask for specific banks to be shown?
        if (hasBanks) {
          return !instrument._ungrouped.some(
            (ungrouped) => ungrouped.bank === preferred.banks[0]
          );
        }

        return true;
      }

      case 'wallet': {
        const hasWallets = Boolean(instrument.wallets);

        // Does the instrument ask for specific wallets to be shown?
        if (hasWallets) {
          return !instrument._ungrouped.some(
            (ungrouped) => ungrouped.wallet === preferred.wallets[0]
          );
        }

        return true;
      }

      /**
       * Card and EMI instruments will not be ungrouped by getBlockConfig as a
       * special case (to avoid large no. of permutations when iins are used).
       * Hence we are checking for presence in arrays.
       */
      case 'card':
      case 'emi': {
        // Always show card and emi instruments
        return true;
      }
      // TODO: filter out based on iins as well
      // TODO: filter out / remove plans excluding the durations for emi

      case 'upi': {
        const instrumentHasFlows = Boolean(instrument.flows);
        const instrumentHasApps = Boolean(instrument.apps);
        const preferredHasApps = Boolean(preferred.apps);

        // If there are any apps, check if the app matches
        if (preferredHasApps && instrumentHasApps) {
          return !instrument._ungrouped.some(
            (ungrouped) => ungrouped.app === preferred.apps[0]
          );
        }

        // If there are any flows, check if the flows match and is invidiual flow
        if (instrumentHasFlows) {
          const individualFlows = ['qr'];
          return !instrument._ungrouped.some(
            (ungrouped) =>
              individualFlows.includes(ungrouped.flow) &&
              ungrouped.flow === preferred.flows[0]
          );
        }

        return true;
      }

      case 'cardless_emi':
      case 'paylater': {
        const hasProviders = Boolean(instrument.providers);

        // Does the instrument ask for specific providers to be shown?
        if (hasProviders) {
          return !instrument._ungrouped.some(
            (ungrouped) => ungrouped.provider === preferred.providers[0]
          );
        }

        return true;
      }
    }

    return true;
  });
}

function makeLoaderInstruments(howMany) {
  const loaderInstrument = {
    _type: 'instrument',
    _loading: true,
  };

  let instruments = [];

  for (let i = 0; i < howMany; i++) {
    instruments.push(ObjectUtils.clone(loaderInstrument));
  }

  return instruments;
}

export function setBlocks(
  {
    showPreferredLoader = false,
    preferred = [],
    merchantConfig = {},
    configSource,
  },
  customer
) {
  const preferredBlock = generateBasePreferredBlock(preferred);
  const parsedConfig = getBlockConfig(merchantConfig, customer);

  // Remove rzp block instruments and method instruments
  const shownIndividualInstruments = parsedConfig.display.blocks
    .filter((block) => block.code !== 'rzp.cluster')
    .flatMap((block) =>
      block.instruments.filter(
        (instrument) => instrument._ungrouped.length === 1
      )
    )
    .filter((instrument) => !isInstrumentForEntireMethod(instrument));

  // show_default_blocks defaults to true
  const show_default_blocks = ObjectUtils.get(
    parsedConfig,
    'display.preferences.show_default_blocks',
    true
  );

  // Add preferred methods block only if restrictions are not used and default blocks should be shown
  const addPreferredInstrumentsBlock =
    !parsedConfig._meta.hasRestrictedInstruments && show_default_blocks;

  let allBlocks = parsedConfig.display.blocks;

  // CREDIT/DEBIT experiment is enabled then set the blocks here
  updateBlocksForExperiments(allBlocks);

  if (addPreferredInstrumentsBlock) {
    if (showPreferredLoader) {
      preferredBlock.instruments = makeLoaderInstruments(
        getMaxPreferredMethods()
      );
    } else {
      const preferredInstruments = preferredBlock.instruments;

      // Filter out all preferred methods whose methods are asked to be hidden
      let filteredPreferredInstruments = preferredInstruments.filter(
        (preferredInstrument) => {
          return isMethodUsable(preferredInstrument.method);
        }
      );

      // Filter out all preferred instruments which are hidden using hide in config
      filteredPreferredInstruments = filteredPreferredInstruments.filter(
        (instrument) =>
          !isP13nInstrumentHiddenViaConfig(
            instrument,
            parsedConfig.display.hide.instruments,
            customer
          )
      );

      // Filter out all preferred methods that are already being shown by the merchant
      filteredPreferredInstruments = filteredPreferredInstruments.filter(
        (instrument) =>
          shouldAllowPreferredInstrument(instrument, shownIndividualInstruments)
      );

      // Take top 3 preferred
      preferredBlock.instruments = filteredPreferredInstruments.slice(
        0,
        getMaxPreferredMethods()
      );

      // Convert preferred instruments to ungrouped format
      preferredBlock.instruments = preferredBlock.instruments.map(
        (instrument) => getIndividualInstruments(instrument, customer)
      );
    }

    allBlocks = [preferredBlock].concat(allBlocks);
  }

  // Filter out blocks with no instruments & check for walnut 369 exist in block
  allBlocks = allBlocks.filter((block) => {
    const _instruments = block?.instruments || [];
    return _instruments.length > 0;
  });
  // Add an ID to all instruments
  allBlocks.forEach((block, blockIndex) => {
    block.instruments.forEach((instrument, instrumentIndex) => {
      // set banner boolean (not releasing in 1st phase of walnut 369)
      // check for walnut369 enable, NC emi feature enable & walnut 369 not in any of other blocks
      // if (
      //   instrument?.method === 'cardless_emi' &&
      //   walnut369Enabled &&
      //   walnutNCEnabled &&
      //   !walnut369Visible &&
      //   block.code === 'rzp.cluster'
      // ) {
      //   instrument.showWalnutBanner = true;
      // }
      addDowntimeToBlock(instrument);
      if (!instrument.id) {
        instrument.id = generateInstrumentId(
          customer,
          block,
          instrument,
          blockIndex,
          instrumentIndex
        );
      }
    });
  });

  const hasCustomConfig = parsedConfig._meta.hasCustomizations;
  Analytics.setMeta('config.custom', hasCustomConfig);
  const session = getSession();
  const onMethodScreen = session.homeTab?.onMethodsScreen();
  Analytics.track('config:blocks', {
    type: AnalyticsTypes.RENDER,
    data: {
      final: allBlocks,
      merchant: merchantConfig,
      source: configSource,
      custom: hasCustomConfig,
      onMethodScreen,
    },
  });

  hiddenMethods.set(parsedConfig.display.hide.methods);
  hiddenInstruments.set(parsedConfig.display.hide.instruments);
  blocks.set(allBlocks);
  sequence.set(parsedConfig.display.sequence);

  return {
    merchant: parsedConfig,
    preferred: preferredBlock,
    all: allBlocks,
  };
}

/**
 * Generate an instrument ID.
 *
 * We're not using a random IDs because the blocks list is regenerated every time the
 * customer changes. If the IDs change, the currently selected instrument gets deselected - which should not happen.
 *
 * At the time of writing, I don't see any way for these IDs to collide when customer/amount changes. - Umang
 *
 * @param {Customer} customer
 * @param {Block} block
 * @param {Instrument} instrument
 * @param {number} blockIndex
 * @param {number} instrumentIndex
 */
function generateInstrumentId(
  customer,
  block,
  instrument,
  blockIndex,
  instrumentIndex
) {
  let base = `${block.code}_${blockIndex}_${instrumentIndex}_${instrument.method}_${customer.logged}`;

  if (customer && customer.contact) {
    base = `${hashFnv32a(customer.contact)}_${base}`;
  }

  return base;
}

/**
 * Returns the block that contains the instrument
 * @param {Instrument} instrument
 * @param {Array<Blocks>} blocks
 *
 * @returns {Block|undefined}
 */
function getInstrumentBlock(instrument, blocks) {
  return blocks.find((block) => {
    return block.instruments.some(
      (blockInstrument) => blockInstrument.id === instrument.id
    );
  });
}

/**
 * Returns meta information about the instrument
 * @param {Instrument} instrumnt
 *
 * @returns {Object} meta
 */
export function getInstrumentMeta(instrument) {
  const allBlocks = storeGetter(blocks);
  const block = getInstrumentBlock(instrument, allBlocks);

  let meta = {};

  if (block) {
    // All indices should be one-indexed

    meta.indexOfBlock = allBlocks.indexOf(block) + 1;

    meta.indexInBlock =
      block.instruments.findIndex(
        (blockInstrument) => blockInstrument.id === instrument.id
      ) + 1;

    meta.indexInInstruments =
      storeGetter(instruments).findIndex(
        (storeInstrument) => storeInstrument.id === instrument.id
      ) + 1;

    meta.block = {
      title: block.title,
      code: block.code,
    };
  }

  return meta;
}

function addDowntimeToBlock(block) {
  const downtimes = getDowntimes();
  let downtimeSeverity = '';
  let downtimeInstrument = '';
  switch (block.method) {
    case 'netbanking': {
      if (!block.banks || block.banks.length === 0) {
        return block;
      }
      downtimeSeverity = checkDowntime(
        downtimes.netbanking,
        'bank',
        block.banks[0]
      );
      downtimeInstrument = block.banks[0];
      break;
    }
    case 'upi': {
      if (block.apps && block.apps.length > 0) {
        const appName = getAppFromPackageName(block.apps[0]).shortcode;
        downtimeSeverity = checkDowntime(downtimes.upi, 'psp', appName);
        downtimeInstrument = appName;
      } else {
        downtimeSeverity = checkDowntime(
          downtimes.upi,
          'vpa_handle',
          block.vpas && block.vpas[0]?.split('@')[1]
        );
        downtimeInstrument = block.vpas && block.vpas[0]?.split('@')[1];
      }
      break;
    }
    case 'card': {
      const downtimesArr = ['low', 'medium', 'high'];
      let issuerDowntime;
      let networkDowntime;
      if (block.issuers && block.issuers.length > 0) {
        issuerDowntime = checkDowntime(
          downtimes.cards,
          'issuer',
          block.issuers[0]
        );
      }
      if (block.networks && block.networks.length > 0) {
        networkDowntime = checkDowntime(
          downtimes.cards,
          'network',
          block.networks[0]
        );
      }
      if (!issuerDowntime && !networkDowntime) {
        return block;
      }
      if (issuerDowntime && networkDowntime) {
        if (
          downtimesArr.indexOf(networkDowntime) >=
          downtimesArr.indexOf(issuerDowntime)
        ) {
          downtimeSeverity = networkDowntime;
          downtimeInstrument = block.networks[0];
        } else {
          downtimeSeverity = issuerDowntime;
          downtimeInstrument = block.issuers[0];
        }
      } else {
        downtimeSeverity = issuerDowntime || networkDowntime;
        downtimeInstrument = issuerDowntime
          ? block.issuers[0]
          : block.networks[0];
      }
      break;
    }
  }
  if (downtimeSeverity) {
    block.downtimeSeverity = downtimeSeverity;
    block.downtimeInstrument = downtimeInstrument;
  }
  return block;
}

/**
 * Tells whether a block is visible or not.
 *
 * @param {string} method
 * @returns {boolean}
 */

export function isInstrumentHidden(instrument) {
  try {
    if (!instrument?.method) {
      return false;
    }

    const merchantConfig = getMerchantConfig().config;
    const parsedConfig = getBlockConfig(merchantConfig, storeGetter(customer));
    const show_default_blocks =
      parsedConfig.display.preferences?.show_default_blocks ?? true;

    if (show_default_blocks === false) {
      return true;
    }
    const methodsToHide = parsedConfig.display.hide.methods;

    if (methodsToHide.includes(instrument.method)) {
      return true;
    }

    const instrumentsToHide = parsedConfig.display.hide.instruments;

    switch (instrument.method) {
      case 'upi': {
        if (instrument.flow && instrumentsToHide?.length > 0) {
          return instrumentsToHide.some((i) => i.flow === instrument.flow);
        }
        break;
      }
    }

    return false;
  } catch (e) {
    return false;
  }
}
