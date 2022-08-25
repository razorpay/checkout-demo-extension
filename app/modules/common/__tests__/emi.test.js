import { isDebitEMIBank, isDebitIssuer } from 'common/bank';

describe('Debit Card EMI', () => {
  test('should have selected bank as DC EMI bank', () => {
    const selectedBank = 'HDFC_DC';
    expect(isDebitIssuer(selectedBank)).toBeTruthy();
  });
  test('should have selected bank as DC EMI bank', () => {
    const selectedBank = 'HDFC';
    expect(isDebitIssuer(selectedBank)).toBeFalsy();
  });
  /**
   * Currently EMI issuers list include [HDFC, KKBK]
   */
  test('Selected Bank is emi inclusive issuer', () => {
    const selectedBank = 'HDFC';
    expect(isDebitEMIBank(selectedBank)).toBeTruthy();
  });
  test('Selected Bank is not a emi inclusive issuer', () => {
    const selectedBank = 'SBIN';
    expect(isDebitEMIBank(selectedBank)).toBeFalsy();
  });
  test('Should have selected bank as DC EMI bank if card type is debit', () => {
    const selectedBank = 'HDFC';
    const cardType = 'debit';
    expect(isDebitEMIBank(selectedBank, cardType)).toBeTruthy();
  });
  test('Should have selected bank as DC EMI bank if card type is debit', () => {
    const selectedBank = 'SBIN';
    const cardType = 'debit';
    expect(isDebitEMIBank(selectedBank, cardType)).toBeFalsy();
  });
  test('Should have selected bank as DC EMI bank if card type is debit', () => {
    const selectedBank = 'HDFC';
    const cardType = 'credit';
    expect(isDebitEMIBank(selectedBank, cardType)).toBeFalsy();
  });
});
