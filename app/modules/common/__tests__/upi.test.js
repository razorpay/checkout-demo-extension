import { parseUPIIntentResponse, didUPIIntentSucceed } from '../upi_helpers';

const responseWithResult = {
  response: {
    result:
      'txnId=YBL7ee273a2d29c4d44a3b88a5537015062&txnRef=EZV2021091410263562780334&Status=Success&responseCode=00',
  },
};
const gpayResponse = {
  response: {
    tezResponse:
      '{"Status":"SUCCESS","amount":"1.01","txnRef":"HxGuCKN11ViZyX","toVpa":"razor.pay@sbi","txnId":"ICIc8bbed5eb23c44f2aea74b4edb96f0d9","responseCode":"0"}',
    txnId: 'ICIc8bbed5eb23c44f2aea74b4edb96f0d9',
    responseCode: '0',
    ApprovalRefNo: '',
    Status: 'SUCCESS',
    txnRef: 'HxGuCKN11ViZyX',
    TrtxnRef: 'HxGuCKN11ViZyX',
    signature:
      '304402207b2de6ee8fe5f047d3a6c31528324f2421d0493a70938dbb7186fe4e0fef343e022051083321ae0642b3a633d1890150021201c083b10c8152b83c122c11abdab75e',
    signatureKeyId: 'PAYMENT_RESPONSE_V2',
  },
};
const modifiedResponse = {
  response: {
    result:
      '{"Status":"SUCCESS","amount":"1.01","txnRef":"HxGuCKN11ViZyX","toVpa":"razor.pay@sbi","txnId":"ICIc8bbed5eb23c44f2aea74b4edb96f0d9","responseCode":"0"}',
    txnId: 'ICIc8bbed5eb23c44f2aea74b4edb96f0d9',
    responseCode: '0',
    ApprovalRefNo: '',
    Status: 'SUCCESS',
    txnRef: 'HxGuCKN11ViZyX',
    TrtxnRef: 'HxGuCKN11ViZyX',
    signature:
      '304402207b2de6ee8fe5f047d3a6c31528324f2421d0493a70938dbb7186fe4e0fef343e022051083321ae0642b3a633d1890150021201c083b10c8152b83c122c11abdab75e',
    signatureKeyId: 'PAYMENT_RESPONSE_V2',
  },
};

describe('Parse UPI Response', () => {
  test('UPI Response with response as expected object', () => {
    expect(didUPIIntentSucceed(parseUPIIntentResponse(gpayResponse))).toBe(
      true
    );
  });
  test('UPI Response with response as expected string', () => {
    expect(
      didUPIIntentSucceed(
        parseUPIIntentResponse({ response: responseWithResult.response.result })
      )
    ).toBe(true);
  });
  test('UPI Response with response as an object of result', () => {
    expect(
      didUPIIntentSucceed(parseUPIIntentResponse(responseWithResult))
    ).toBe(true);
  });
  test('UPI Response with response as an object of result object', () => {
    expect(didUPIIntentSucceed(parseUPIIntentResponse(modifiedResponse))).toBe(
      true
    );
  });
  test('UPI Response with response as an string of result object', () => {
    expect(didUPIIntentSucceed(parseUPIIntentResponse(modifiedResponse))).toBe(
      true
    );
  });
  test('UPI Response with response as an array', () => {
    expect(
      didUPIIntentSucceed(
        parseUPIIntentResponse({
          response: [],
        })
      )
    ).toBe(false);
  });
  test('UPI Response with response as an array', () => {
    expect(
      didUPIIntentSucceed(
        parseUPIIntentResponse({
          ...gpayResponse,
          response: {
            ...gpayResponse.response,
            txnId: null,
            Status: 'Failed',
          },
        })
      )
    ).toBe(false);
  });
});
