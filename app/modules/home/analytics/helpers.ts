import { AnalyticsV2State, ContextProperties, EventsV2 } from 'analytics-v2';
import { Events } from 'analytics';
import { MiscTracker } from 'misc/analytics/events';
import { CardsTracker } from 'card/analytics/events';
import { NetbankingTracker } from 'netbanking/analytics/events';
import {
  isInstrumentForEntireMethod,
  isSavedCardInstrument,
} from 'configurability/instruments';
import { getInstrumentDetails } from 'ui/tabs/home/helpers';
import { METHODS } from 'checkoutframe/constants';
import { HOME_EVENTS } from 'analytics/home/events';
import { PaylaterTracker } from 'ui/tabs/paylater/analytics/events';

const { CARD, NETBANKING, PAYLATER } = METHODS;
const Tracker = {
  [CARD]: CardsTracker,
  [NETBANKING]: NetbankingTracker,
  [PAYLATER]: PaylaterTracker,
};

type MetaType = {
  preferred: boolean;
};

type Ungrouped = {
  bank?: string;
  meta?: MetaType;
  issuer?: string;
  network?: string;
  type?: string;
  token_id?: string;
};

// TODO: the InstrumentType need to updated respective to all the methods
type InstrumentType = {
  section: string;
  blockTitle?: string;
  banks?: Array<string>;
  id?: string;
  meta?: MetaType;
  networks?: Array<string>;
  issuers?: Array<string>;
  types?: Array<string>;
  method: string;
  skipCTAClick?: boolean;
  token_id?: string;
  consent_taken?: string;
  _type?: string;
  _ungrouped?: Array<Ungrouped>;
};

/**
 * method gives the selected section.
 * @param {String} method
 *
 * @returns {String}
 */
export const getSelectedSection = (section: string): string =>
  section === 'generic' ? 'gen' : section;

/**
 * trigger a respective analyticsV2 event when a method is shown.
 * @param {String} method
 */
export const genericMethodShown = (method: string): void => {
  Tracker[method]?.GEN_SHOWN();
};

/**
 * trigger a respective analyticsV2 event when a p13n instrument is shown.
 * @param {InstrumentType} instrument
 */
export const p13nInstrumentShown = (instrument: InstrumentType): void => {
  const { method } = instrument;

  if (typeof (Tracker[method] as any)?.P13N_SHOWN === 'function') {
    (Tracker[method] as any)?.P13N_SHOWN({
      instrument: getInstrumentDetails(instrument),
    });
  }
};

/**
 * trigger a respective analyticsV2 event when a p13n instrument or method is selected.
 * @param {InstrumentType} instrument
 */
export const specificMethodSelected = (instrument: InstrumentType): void => {
  const { method, meta } = instrument;
  if (typeof Tracker[method]?.SELECTED === 'function') {
    const payload = meta?.preferred
      ? {
          instrument: getInstrumentDetails(instrument),
        }
      : '';
    Tracker[method].SELECTED(payload);
  }
};

/**
 * trigger analytics events when a mothod or instrument is selected on p13n, custom or generic block on L0 screen.
 * @param {InstrumentType} instrument
 */
export function triggerInstAnalytics(instrument: InstrumentType) {
  EventsV2.setContext(
    ContextProperties.SECTION,
    getSelectedSection(instrument?.section)
  );
  AnalyticsV2State.selectedBlock = {
    category: instrument.section,
    name: instrument.blockTitle || '',
  };

  try {
    specificMethodSelected(instrument);
    MiscTracker.METHOD_SELECTED({
      block: { category: instrument.section, name: instrument.blockTitle },
      method: { name: instrument.method },
    });

    if (!isInstrumentForEntireMethod(instrument)) {
      MiscTracker.INSTRUMENT_SELECTED({
        block: {
          category: instrument.section,
          name: instrument.blockTitle,
        },
        method: { name: instrument.method },
        instrument: getInstrumentDetails(instrument),
      });
    }

    if (instrument.method === CARD && isSavedCardInstrument(instrument)) {
      CardsTracker.SAVED_CARD_SELECTED({
        instrument: {
          network: instrument.networks?.[0],
          issuer: instrument.issuers?.[0],
          type: instrument.types?.[0],
        },
      });
    }
  } catch {}
  Events.TrackMetric(HOME_EVENTS.PAYMENT_INSTRUMENT_SELECTED, {
    instrument,
  });
  Events.TrackBehav(HOME_EVENTS.PAYMENT_INSTRUMENT_SELECTED_V2, {
    instrument,
  });
  Events.TrackBehav(HOME_EVENTS.PAYMENT_METHOD_SELECTED_V2, {
    method: instrument.method,
    section: instrument.section,
  });
}
