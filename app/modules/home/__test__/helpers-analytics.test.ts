import {
  getSelectedSection,
  genericMethodShown,
  p13nInstrumentShown,
  specificMethodSelected,
  getCurrentScreen,
} from 'home/analytics/helpers';
import { CardsTracker } from 'card/analytics/events';
import { METHODS } from 'checkoutframe/constants';

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
    },
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
