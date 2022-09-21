import { overrideStorageInstruments } from '../index';
import * as UA from 'common/useragent';
import type { Personalization } from '../personalization';

jest.mock('common/useragent', () => ({
  ...jest.requireActual('common/useragent'),
  isDesktop: jest.fn(),
}));

const isDesktop = UA.isDesktop as jest.MockedFunction<typeof UA.isDesktop>;
const instruments: Personalization.V1_Instrument_Raw[] = [
  {
    frequency: 2,
    id: 'JOrD5cf04GCWn4',
    success: false,
    timestamp: 1651166628986,
    '_[flow]': 'intent',
    method: 'upi',
  },
  {
    frequency: 1,
    id: 'JVcOwmYGtUfF3H',
    method: 'upi',
    success: false,
    timestamp: 1652642826065,
    token_id: 'token_HrUHnt4GIx9Q3p',
    vpa: '8344881425@upi',
    '_[flow]': 'directpay',
  },
  {
    frequency: 20,
    id: 'JT4Zjzs1nUiGCq',
    success: true,
    timestamp: 1652698924736,
    bank: 'SBIN',
    method: 'netbanking',
  },
];

const PHONEPE_WALLET_STORAGE_INSTRUMENT = {
  frequency: 4,
  id: 'JMPUBLKOcwFWlK',
  method: 'wallet',
  success: true,
  timestamp: 1651212306144,
  wallet: 'phonepe',
};
const PHONEPE_UPI_STORAGE_INSTRUMENT = {
  ...PHONEPE_WALLET_STORAGE_INSTRUMENT,
  '_[flow]': 'intent',
  method: 'upi',
  upi_app: 'com.phonepe.app',
};
delete (PHONEPE_UPI_STORAGE_INSTRUMENT as any)['wallet'];

describe('Module: personalization', () => {
  describe('P13N V1 - Storage Based', () => {
    describe('overrideStorageInstruments', () => {
      test('Non phonepe-wallet instruments should be passed through as is', () => {
        const updatedInstruments = overrideStorageInstruments(instruments);

        expect(updatedInstruments).toHaveLength(instruments.length);
        expect(updatedInstruments).toEqual(
          expect.arrayContaining(
            instruments.map((i) => expect.objectContaining(i))
          )
        );
      });

      test('Phonepe-wallet instruments should be modified to PhonePe UPI Intent Instrument in non-desktop', () => {
        isDesktop.mockReturnValue(false);
        const customInstruments = [PHONEPE_WALLET_STORAGE_INSTRUMENT];
        const updatedInstruments =
          overrideStorageInstruments(customInstruments);

        expect(updatedInstruments).toHaveLength(customInstruments.length);
        expect(updatedInstruments).toEqual(
          expect.arrayContaining([
            expect.objectContaining(PHONEPE_UPI_STORAGE_INSTRUMENT),
          ])
        );
      });

      test('Phonepe-wallet instruments should be modified to PhonePe UPI Intent Instrument in desktop', () => {
        isDesktop.mockReturnValue(true);
        const customInstruments = [PHONEPE_WALLET_STORAGE_INSTRUMENT];
        const updatedInstruments =
          overrideStorageInstruments(customInstruments);

        expect(updatedInstruments).toHaveLength(customInstruments.length);
        expect(updatedInstruments).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              ...PHONEPE_UPI_STORAGE_INSTRUMENT,
              vendor_vpa: '@ybl',
            }),
          ])
        );
      });

      test('Combination of Phonepe-wallet + other instruments should be modified to PhonePe UPI + instruments', () => {
        isDesktop.mockReturnValue(false);
        const customInstruments = [
          PHONEPE_WALLET_STORAGE_INSTRUMENT,
          ...instruments,
        ];
        const updatedInstruments =
          overrideStorageInstruments(customInstruments);

        expect(updatedInstruments).toHaveLength(customInstruments.length);
        expect(updatedInstruments).toEqual(
          expect.arrayContaining([
            expect.objectContaining(PHONEPE_UPI_STORAGE_INSTRUMENT),
            ...instruments.map((i) => expect.objectContaining(i)),
          ])
        );
      });
    });
  });
});
