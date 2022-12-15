import {
  overrideAPIInstruments,
  removeDuplicateApiInstruments,
  trackP13nMeta,
} from '../api';
import { DEFAULT_PHONEPE_P13N_V2_INSTRUMENT } from '../constants';
import type { Personalization } from '../personalization';
import { P13NTracker } from 'misc/analytics/events';

jest.mock('misc/analytics/events', () => {
  const originalModule = jest.requireActual('misc/analytics/events');

  return {
    __esModule: true,
    ...originalModule,
    P13NTracker: {
      P13N_RESPONSE: jest.fn(),
    },
  };
});

const instruments: Personalization.V2_Instrument_Raw[] = [
  {
    method: 'netbanking',
    instrument: 'HDFC',
  },
  {
    method: 'card',
    instrument: 'card',
  },
  {
    method: 'upi',
    instrument: '@okhdfcbank',
  },
  {
    method: 'upi',
    instrument: '@okhdfcbank',
  },
  {
    method: 'netbanking',
    instrument: 'SBIN',
  },
];

const PHONEPE_WALLET_API_INSTRUMENT: Personalization.V2_Instrument_Raw = {
  method: 'wallet',
  instrument: 'phonepe',
};

describe('Module: personalization', () => {
  describe('P13N V2 - API Based', () => {
    describe('overrideAPIInstruments', () => {
      test('Non phonepe-wallet instruments should be passed through as is', () => {
        const updatedInstruments = overrideAPIInstruments(instruments);

        expect(updatedInstruments).toHaveLength(instruments.length);
        expect(updatedInstruments).toEqual(
          expect.arrayContaining(
            instruments.map((i) => expect.objectContaining(i))
          )
        );
      });

      test('Phonepe-wallet instruments should be modified to PhonePe UPI Instrument', () => {
        const customInstruments = [PHONEPE_WALLET_API_INSTRUMENT];
        const updatedInstruments = overrideAPIInstruments(customInstruments);

        expect(updatedInstruments).toHaveLength(customInstruments.length);
        expect(updatedInstruments).toEqual(
          expect.arrayContaining([
            expect.objectContaining(DEFAULT_PHONEPE_P13N_V2_INSTRUMENT),
          ])
        );
      });

      test('Combination of Phonepe-wallet + other instruments should be modified to PhonePe UPI + instruments', () => {
        const customInstruments = [
          PHONEPE_WALLET_API_INSTRUMENT,
          ...instruments,
        ];
        const updatedInstruments = overrideAPIInstruments(customInstruments);

        expect(updatedInstruments).toHaveLength(customInstruments.length);
        expect(updatedInstruments).toEqual(
          expect.arrayContaining([
            expect.objectContaining(DEFAULT_PHONEPE_P13N_V2_INSTRUMENT),
            ...instruments.map((i) => expect.objectContaining(i)),
          ])
        );
      });
    });
  });
  describe('Tests for removeDuplicateApiInstruments under api.js', () => {
    it('should return unique instruments from a given list of instruments', () => {
      const data = [
        {
          instrument: 'lazypay',
          method: 'paylater',
        },
        {
          instrument: 'lazypay',
          method: 'paylater',
        },
      ];
      const expectedReturnValue = [
        {
          instrument: 'lazypay',
          method: 'paylater',
        },
      ];
      expect(removeDuplicateApiInstruments(data)).toEqual(expectedReturnValue);
    });
  });
  describe('Tests for trackP13nMeta under api.js', () => {
    it('should return undefined if passed empty data', () => {
      expect(trackP13nMeta({})).toBeUndefined();
    });
    it('should call P13NTracker once if passed valid data', () => {
      const data = {
        '+918708857906': {
          instruments: [
            {
              instrument: 'lazypay',
              method: 'paylater',
            },
            {
              instrument: '',
              method: 'upi',
            },
            {
              method: 'card',
              token_id: 'card',
            },
          ],
          is_customer_identified: true,
          user_aggregates_available: true,
          versionID: 'v1',
        },
      };
      trackP13nMeta(data);
      expect(P13NTracker.P13N_RESPONSE).toHaveBeenCalled();
    });
  });
});
