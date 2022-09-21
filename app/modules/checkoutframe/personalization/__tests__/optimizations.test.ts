import * as razorpay from 'razorpay';
import * as UA from 'common/useragent';
import { optimizeForDevice, optimizeForAmount } from '../optimizations';
import type { Personalization } from '../personalization';

jest.mock('common/useragent', () => ({
  isDesktop: jest.fn(),
}));

jest.mock('razorpay', () => ({
  getAmount: jest.fn(),
  isInternational: jest.fn(() => false),
}));

const isDesktop = UA.isDesktop as jest.MockedFunction<typeof UA.isDesktop>;
const getAmount = razorpay.getAmount as jest.MockedFunction<
  typeof razorpay.getAmount
>;

const instruments: Personalization.Instrument[] = [
  {
    method: 'netbanking',
    bank: 'HDFC',
  },
  {
    method: 'card',
    token_id: 'card',
  },
  {
    method: 'upi',
    vpa: '@okhdfcbank',
    '_[flow]': 'intent',
    upi_app: 'com.google.android.apps.nbu.paisa.user',
  },
  {
    method: 'upi',
    vpa: '@okhdfcbank',
    '_[flow]': 'intent',
    upi_app: 'com.google.android.apps.nbu.paisa.user',
  },
  {
    method: 'netbanking',
    bank: 'SBIN',
  },
  {
    method: 'wallet',
    bank: 'phonepe',
  },
];

describe('Module: personalization', () => {
  beforeAll(() => {});
  describe('Optimizations', () => {
    describe('optimizeForDevice', () => {
      test('Only allow "card" and "upi" methods in mobile', () => {
        isDesktop.mockReturnValue(false);

        const optimizedInstruments = optimizeForDevice(instruments);

        expect(optimizedInstruments).toHaveLength(3);
        expect(optimizedInstruments).toEqual(
          expect.arrayContaining([
            expect.objectContaining(instruments[1]),
            expect.objectContaining(instruments[2]),
            expect.objectContaining(instruments[3]),
          ])
        );
      });

      test('Only allow "card", "upi" and "netbanking" methods in desktop', () => {
        isDesktop.mockReturnValue(true);

        const optimizedInstruments = optimizeForDevice(instruments);

        expect(optimizedInstruments).toHaveLength(5);
        expect(optimizedInstruments).toEqual(
          expect.arrayContaining([
            expect.objectContaining(instruments[0]),
            expect.objectContaining(instruments[1]),
            expect.objectContaining(instruments[2]),
            expect.objectContaining(instruments[3]),
            expect.objectContaining(instruments[4]),
          ])
        );
      });
    });
    describe('optimizeForAmount', () => {
      test('No optimizations based on amount on non-desktop devices for any amount - Amount INR 100', () => {
        isDesktop.mockReturnValue(false);
        getAmount.mockReturnValue(10000);

        const optimizedInstruments = optimizeForAmount(instruments);

        expect(optimizedInstruments).toHaveLength(instruments.length);
        expect(optimizedInstruments).toEqual(
          expect.arrayContaining(
            instruments.map((i) => expect.objectContaining(i))
          )
        );
      });

      test('No optimizations based on amount on non desktop devices for any amount - Amount INR 6000', () => {
        isDesktop.mockReturnValue(false);
        getAmount.mockReturnValue(600000);

        const optimizedInstruments = optimizeForAmount(instruments);

        expect(optimizedInstruments).toHaveLength(instruments.length);
        expect(optimizedInstruments).toEqual(
          expect.arrayContaining(
            instruments.map((i) => expect.objectContaining(i))
          )
        );
      });

      test('Only allow "card" and "upi" methods in desktop for amount less than or equal to 5000 - Amount INR 100', () => {
        isDesktop.mockReturnValue(true);
        getAmount.mockReturnValue(10000);

        const optimizedInstruments = optimizeForAmount(instruments);

        expect(optimizedInstruments).toHaveLength(3);
        expect(optimizedInstruments).toEqual(
          expect.arrayContaining([
            expect.objectContaining(instruments[1]),
            expect.objectContaining(instruments[2]),
            expect.objectContaining(instruments[3]),
          ])
        );
      });

      test('Only allow "card" and "upi" methods in desktop for amount less than or equal to 5000 - Amount INR 5000', () => {
        isDesktop.mockReturnValue(true);
        getAmount.mockReturnValue(500000);

        const optimizedInstruments = optimizeForAmount(instruments);

        expect(optimizedInstruments).toHaveLength(3);
        expect(optimizedInstruments).toEqual(
          expect.arrayContaining([
            expect.objectContaining(instruments[1]),
            expect.objectContaining(instruments[2]),
            expect.objectContaining(instruments[3]),
          ])
        );
      });
      test('Only allow "card", "upi" and "netbanking" methods in desktop for amount greater than 5000', () => {
        isDesktop.mockReturnValue(true);
        getAmount.mockReturnValue(500100);

        const optimizedInstruments = optimizeForAmount(instruments);

        expect(optimizedInstruments).toHaveLength(5);
        expect(optimizedInstruments).toEqual(
          expect.arrayContaining([
            expect.objectContaining(instruments[0]),
            expect.objectContaining(instruments[1]),
            expect.objectContaining(instruments[2]),
            expect.objectContaining(instruments[3]),
            expect.objectContaining(instruments[4]),
          ])
        );
      });
    });
  });
});
