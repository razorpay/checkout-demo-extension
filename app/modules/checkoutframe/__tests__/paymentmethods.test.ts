import * as PaymentMethods from 'checkoutframe/paymentmethods';
import * as CheckoutStore from 'checkoutstore/methods';
import * as mock from './mock/paymentmethods';

describe('Module: checkoutframe/paymentmethods', () => {
  test('PaymentMethods.getTranslatedMethodPrefix', () => {
    const methods = [
      'card',
      'upi',
      'netbanking',
      'wallet',
      'emi',
      'paylater',
      'international',
    ];
    const expectedValues = [
      'Cards',
      'UPI',
      'Netbanking',
      'Wallets',
      'EMI',
      'PayLater',
      'International',
    ];
    const locale = 'en';
    methods.forEach((method, idx) => {
      const prefix = PaymentMethods.getTranslatedMethodPrefix(method, locale);
      expect(prefix).toEqual(expectedValues[idx]);
    });
  });
  test('PaymentMethods.getAllMethods', () => {
    const allMethods = PaymentMethods.getAllMethods();
    expect(allMethods).toEqual(mock.allMethodsExpectedValue);
  });
  test('PaymentMethods.getEMIBanksText', () => {
    (CheckoutStore.getEMIBanks as any) = jest.fn().mockImplementation(() => {
      return mock.emiBanks;
    });
    const locale = 'en';
    expect(PaymentMethods.getEMIBanksText(locale)).toEqual(
      mock.expectedEMIBankText
    );
  });
  test('PaymentMethods.getMethodNameForPaymentOption for upi flow qr enabled true', () => {
    (CheckoutStore.isMethodEnabled as any) = jest
      .fn()
      .mockImplementation((method) => {
        if (method === 'qr') return true;
        return false;
      });
    expect(PaymentMethods.getMethodNameForPaymentOption('upi', 'en')).toEqual(
      'UPI / QR'
    );
  });
  test('PaymentMethods.getMethodNameForPaymentOption for upi flow qr enabled false', () => {
    (CheckoutStore.isMethodEnabled as any) = jest
      .fn()
      .mockImplementation(() => {
        return false;
      });
    expect(PaymentMethods.getMethodNameForPaymentOption('upi', 'en')).toEqual(
      'UPI'
    );
  });
  test('PaymentMethods.getMethodNameForPaymentOption for emi flow', () => {
    expect(
      PaymentMethods.getMethodNameForPaymentOption('cardless_emi', 'en')
    ).toEqual('EMI');
  });
  test('PaymentMethods.getMethodNameForPaymentOption for emandate flow', () => {
    expect(
      PaymentMethods.getMethodNameForPaymentOption('emandate', 'en')
    ).toEqual('Bank Account');
  });
  test('PaymentMethods.getMethodDescription empty string flow', () => {
    const locale = 'en';
    const method = 'notCorrectMethod';
    expect(PaymentMethods.getMethodDescription(method, locale)).toEqual('');
  });
});
