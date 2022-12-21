import { blocks } from 'checkoutstore/screens/home';
import { getBanks } from 'razorpay';
import {
  getInstrumentDetails,
  addConsentDetailsToInstrument,
  getBlockTitle,
  getSectionsDisplayed,
  getBankText,
  getAvailableMethods,
} from 'ui/tabs/home/helpers';
import {
  addConsentDetailsToInstrumentTestCases,
  getAvailableMethodsTestCases,
  getBanktextTestCases,
  getBlockTitleTestCases,
  getInstrumentDetailsTestCases,
  getSectionsDisplayedTestCases,
} from './__mocks__/data';

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  getBanks: jest.fn(),
}));

describe('test #getInstrumentDetails', () => {
  test.each(getInstrumentDetailsTestCases)('$name', ({ input, output }) => {
    expect(getInstrumentDetails(input)).toStrictEqual(output);
  });
});

describe('test #addConsentDetailsToInstrument', () => {
  test.each(addConsentDetailsToInstrumentTestCases)('$name', ({ input }) => {
    addConsentDetailsToInstrument(input.instrument, input.card);
    expect(input.instrument.consent_taken).toStrictEqual(
      input.card.consent_taken
    );
  });
});

describe('test #getBlockTitle', () => {
  // expect(getBlockTitle(instruments, 'en')).toBe('Cards, UPI & More');
  test.each(getBlockTitleTestCases)('$name', ({ input, output }) => {
    expect(getBlockTitle(input, 'en')).toBe(output);
  });
});

describe('test #getSectionsDisplayed', () => {
  test.each(getSectionsDisplayedTestCases)('$name', ({ input, output }) => {
    expect(getSectionsDisplayed(input)).toEqual(output);
  });
});

describe('test #getBankText', () => {
  test.each(getBanktextTestCases)('$name', ({ input, output, banks }) => {
    (getBanks as unknown as jest.Mock).mockReturnValue(banks);
    expect(getBankText(input, true, false, 'en')).toBe(output);
  });
});

describe('test #getAvailableMethods', () => {
  test.each(getAvailableMethodsTestCases)('$name', ({ input, output }) => {
    blocks.set(input);
    expect(getAvailableMethods()).toEqual(output);
  });
});
