import * as Payouts from 'checkoutframe/payouts';

describe('Module: checkoutframe/paymentmethods', () => {
  test('Payouts.makeTrackingDataFromAccount', () => {
    const data = {
      account_type: 'vpa',
      id: 'fa_KgKmAkSrTACYOV',
      vpa: { username: 'abc', handle: 'oksbi', address: 'abc@oksbi' },
    };
    const returnedValue = Payouts.makeTrackingDataFromAccount(data);
    expect(returnedValue).toEqual(data);
  });

  test('Payouts.createFundAccount', async () => {
    const data = {
      account_type: 'vpa',
      contact_id: 'cont_JL5vcENY9DcY8M',
      id: 'fa_KgKmAkSrTACYOV',
      vpa: {
        address: 'abc@oksbi',
        handle: 'oksbi',
        username: 'abc',
      },
    };
    const expectedValue = {
      error: {
        code: 'BAD_REQUEST_ERROR',
        description: 'The id provided does not exist',
        metadata: {},
        reason: 'input_validation_failed',
        source: null,
        step: null,
      },
      status_code: 400,
    };
    await expect(Payouts.createFundAccount(data)).rejects.toEqual(
      expectedValue
    );
  });
});
