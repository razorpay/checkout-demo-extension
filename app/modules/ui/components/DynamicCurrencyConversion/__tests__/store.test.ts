// testable
import {
  resetDCCPayload,
  setDCCPayload,
  setPaymentMethodOnDCCPayload,
  getDCCPayloadData,
} from '../store';

describe('Test DCCPayload Store', () => {
  test('should able to set and reset dcc payload', () => {
    setDCCPayload({ defaultCurrency: 'USD' });

    expect(getDCCPayloadData()).toStrictEqual({
      defaultCurrency: 'USD',
      method: undefined,
    });

    resetDCCPayload();
    expect(getDCCPayloadData()).toStrictEqual({});
  });

  test('should able to set payment method', () => {
    setPaymentMethodOnDCCPayload('cards');
    expect(getDCCPayloadData()).toStrictEqual({ method: 'cards' });
  });
});
