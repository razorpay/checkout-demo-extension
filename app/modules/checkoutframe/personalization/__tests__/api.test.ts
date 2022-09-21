import { overrideAPIInstruments } from '../api';
import { DEFAULT_PHONEPE_P13N_V2_INSTRUMENT } from '../constants';
import type { Personalization } from '../personalization';

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
});
