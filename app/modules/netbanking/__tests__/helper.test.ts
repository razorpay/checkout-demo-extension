import * as helper from 'netbanking/helper';
import { getOption, getPreferences } from 'razorpay';
jest.mock('razorpay', () => ({
  getOption: jest.fn(() => {}),
  getPreferences: jest.fn(() => {}),
}));

const bankDetailsKeys = [
  'ifsc',
  'name',
  'account_number',
  'account_type',
] as const;

describe('Module: netbanking/helper', () => {
  it('should return SBIN getPrefillBank getPreferences flow', () => {
    (getPreferences as unknown as jest.Mock).mockReturnValue('SBIN');
    expect(helper.getPrefillBank()).toEqual('SBIN');
  });
  it('should return HDFC getPrefillBank getOption flow', () => {
    (getPreferences as unknown as jest.Mock).mockReturnValue('');
    (getOption as unknown as jest.Mock).mockReturnValue('HDFC');
    expect(helper.getPrefillBank()).toEqual('HDFC');
  });
  it('should return correct prefilled bank details getPreferences flow', () => {
    (getPreferences as unknown as jest.Mock).mockImplementation((path) => {
      switch (path) {
        case 'order.bank_account.ifsc':
          return 'SBIN0010720';
        case 'order.bank_account.name':
          return 'Rahul';
        case 'order.bank_account.account_number':
          return '38727320069';
        case 'order.bank_account.account_type':
          return 'savings';
        default:
          return '';
      }
    });
    (getOption as unknown as jest.Mock).mockReturnValue('');
    const expectedReturnValue = [
      'SBIN0010720',
      'Rahul',
      '38727320069',
      'savings',
    ];
    bankDetailsKeys.forEach((key, idx) => {
      expect(helper.getPrefillBankDetails(key)).toEqual(
        expectedReturnValue[idx]
      );
    });
  });
  it('should return correct prefilled bank details getOption flow', () => {
    (getPreferences as unknown as jest.Mock).mockReturnValue('');
    (getOption as unknown as jest.Mock).mockImplementation((path) => {
      switch (path) {
        case 'prefill.bank_account[ifsc]':
          return 'SBIN0010720';
        case 'prefill.bank_account[name]':
          return 'Rahul';
        case 'prefill.bank_account[account_number]':
          return '38727320069';
        case 'prefill.bank_account[account_type]':
          return 'savings';
        default:
          return '';
      }
    });
    const expectedReturnValue = [
      'SBIN0010720',
      'Rahul',
      '38727320069',
      'savings',
    ];
    bankDetailsKeys.forEach((key, idx) => {
      expect(helper.getPrefillBankDetails(key)).toEqual(
        expectedReturnValue[idx]
      );
    });
  });
  it('should return object with keys but no value, empty key flow', () => {
    (getPreferences as unknown as jest.Mock).mockReturnValue('');
    (getOption as unknown as jest.Mock).mockReturnValue('');
    const expectedReturnValue = {
      'prefill.bank_account[account_number]': '',
      'prefill.bank_account[account_type]': '',
      'prefill.bank_account[ifsc]': '',
      'prefill.bank_account[name]': '',
    };
    expect(helper.getPrefillBankDetails('')).toEqual(expectedReturnValue);
  });
  it('should return prefilled auth type getPreferences flow', () => {
    (getPreferences as unknown as jest.Mock).mockReturnValue('netbanking');
    (getOption as unknown as jest.Mock).mockReturnValue('');
    expect(helper.getAuthType()).toEqual('netbanking');
  });
  it('should return prefilled auth type getOption flow', () => {
    (getPreferences as unknown as jest.Mock).mockReturnValue('');
    (getOption as unknown as jest.Mock).mockReturnValue('netbanking');
    expect(helper.getAuthType()).toEqual('netbanking');
  });
});
