import {
  getSelectedSection,
  genericMethodShown,
  p13nInstrumentShown,
  specificMethodSelected,
  getCurrentScreen,
  triggerInstAnalytics,
} from 'home/analytics/helpers';
import { CardsTracker } from 'card/analytics/events';
import { METHODS } from 'checkoutframe/constants';
import type { InstrumentType } from 'home/analytics/types';
import { MiscTracker } from 'misc/analytics/events';
import { Events } from 'analytics';
import {
  isInstrumentForEntireMethod,
  isSavedCardInstrument,
} from 'configurability/instruments';

const { CARD } = METHODS;
const savedCardInfo = {
  network: 'Visa',
  type: 'debit',
  issuer: 'HDFC',
};
const formattedCardInst = {
  personalisation: true,
  saved: false,
  ...savedCardInfo,
};

jest.mock('card/analytics/events', () => {
  const originalModule = jest.requireActual('card/analytics/events');
  return {
    __esModule: true,
    ...originalModule,
    CardsTracker: {
      GEN_SHOWN: jest.fn(),
      P13N_SHOWN: jest.fn(),
      SELECTED: jest.fn(),
      SAVED_CARD_SELECTED: jest.fn(),
    },
  };
});

jest.mock('misc/analytics/events', () => {
  const originalModule = jest.requireActual('misc/analytics/events');
  return {
    __esModule: true,
    ...originalModule,
    MiscTracker: {
      METHOD_SELECTED: jest.fn(),
      INSTRUMENT_SELECTED: jest.fn(),
    },
  };
});

jest.mock('analytics', () => {
  const originalModule = jest.requireActual('analytics');
  return {
    ...originalModule,
    __esModule: true,
    Events: {
      TrackMetric: jest.fn(),
      TrackBehav: jest.fn(),
    },
  };
});

jest.mock('configurability/instruments', () => {
  const originalModule = jest.requireActual('configurability/instruments');
  return {
    ...originalModule,
    __esModule: true,
    isInstrumentForEntireMethod: jest.fn(),
    isSavedCardInstrument: jest.fn(),
  };
});

describe('test getSelectedSection method', () => {
  it('should return gen keyword when the generic section is selected.', () => {
    expect(getSelectedSection('generic')).toBe('gen');
  });
  it('should return the section name as it is when p13n, custom sections are selected.', () => {
    expect(getSelectedSection('p13n')).toBe('p13n');
  });
});
describe('test genericMethodShown method', () => {
  it('should call CardsTracker.GEN_SHOWN when we pass a valid method parameter.', () => {
    genericMethodShown(CARD);
    expect(CardsTracker.GEN_SHOWN).toHaveBeenCalledTimes(1);
  });
  it('should not call CardsTracker.GEN_SHOWN when we pass an invalid method parameter.', () => {
    genericMethodShown('');
    expect(CardsTracker.GEN_SHOWN).not.toHaveBeenCalled();
  });
});
describe('test p13nInstrumentShown method', () => {
  it('should call CardsTracker.P13N_SHOWN when we pass a valid method parameter.', () => {
    p13nInstrumentShown({ method: CARD, section: 'p13n' });
    expect(CardsTracker.P13N_SHOWN).toHaveBeenCalledTimes(1);
  });
  it('should not call CardsTracker.P13N_SHOWN when we pass an invalid method parameter.', () => {
    p13nInstrumentShown({ method: '', section: 'p13n' });
    expect(CardsTracker.P13N_SHOWN).not.toHaveBeenCalled();
  });
});
describe('test specificMethodSelected method', () => {
  it('should call CardsTracker.SELECTED when we pass a valid method parameter.', () => {
    specificMethodSelected({ method: CARD, section: 'generic' });
    expect(CardsTracker.SELECTED).toHaveBeenCalledTimes(1);
  });
  it('should call CardsTracker.SELECTED when we pass a valid method and instrument parameters', () => {
    const meta = { preferred: true };
    specificMethodSelected({
      method: CARD,
      section: 'p13n',
      meta,
      networks: ['Visa'],
      types: ['debit'],
      issuers: ['HDFC'],
      _ungrouped: [
        {
          network: 'Visa',
          type: 'debit',
          issuer: 'HDFC',
          meta,
        },
      ],
    });
    expect(CardsTracker.SELECTED).toHaveBeenCalledTimes(1);
    expect(CardsTracker.SELECTED).toHaveBeenCalledWith({
      instrument: formattedCardInst,
    });
  });
  it('should not call CardsTracker.SELECTED when we pass an invalid method parameter.', () => {
    specificMethodSelected({ method: '', section: 'generic' });
    expect(CardsTracker.SELECTED).not.toHaveBeenCalled();
  });
});
describe('test getCurrentScreen method', () => {
  it('should return L1 if screen has value.', () => {
    expect(getCurrentScreen('card')).toBe('L1');
  });
  it('should return L0 if the screen value is empty.', () => {
    expect(getCurrentScreen('')).toBe('L0');
  });
});

describe('test triggerInstAnalytics', () => {
  it('it should call MethodSelected and TrackBehav event', () => {
    const instrument = {
      _ungrouped: [
        {
          _type: 'method',
          code: 'card',
          method: 'card',
        },
      ],
      _type: 'method',
      code: 'card',
      method: 'card',
      id: '1d5e83cc_rzp.cluster_1_0_card_true',
      section: 'generic',
      blockTitle: 'Cards, UPI & More',
    };
    triggerInstAnalytics(instrument as InstrumentType);
    expect(MiscTracker.METHOD_SELECTED).toBeCalled();
    expect(Events.TrackMetric).toBeCalled();
    expect(Events.TrackBehav).toBeCalledTimes(2);
  });

  it('it should call Instrument Selected and Save Card Selected Event with others', () => {
    const instrument = {
      _ungrouped: [
        {
          token_id: 'token_JsoqJcB2ltMhd7',
          type: 'debit',
          method: 'card',
          id: 'KmeAFBLGXQRYj8',
          meta: {
            preferred: true,
          },
        },
      ],
      method: 'card',
      id: 'KmeAFBLGXQRYj8',
      token_id: 'token_JsoqJcB2ltMhd7',
      section: 'p13n',
      blockTitle: 'Preferred Payment Methods',
    };
    (isInstrumentForEntireMethod as unknown as jest.Mock).mockReturnValue(
      false
    );
    (isSavedCardInstrument as unknown as jest.Mock).mockReturnValue(true);
    triggerInstAnalytics(instrument as InstrumentType);
    expect(MiscTracker.METHOD_SELECTED).toBeCalled();
    expect(Events.TrackMetric).toBeCalled();
    expect(Events.TrackBehav).toBeCalledTimes(2);
    expect(MiscTracker.INSTRUMENT_SELECTED).toBeCalledTimes(1);
    expect(CardsTracker.SAVED_CARD_SELECTED).toBeCalledTimes(1);
  });
});
