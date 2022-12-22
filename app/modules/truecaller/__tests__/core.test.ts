import { buildTruecallerDeeplink } from '../core';

describe('buildTruecallerDeeplink tests', () => {
  test('should URI encode all the params', async () => {
    expect(
      buildTruecallerDeeplink({
        requestNonce: '00000000',
        lang: 'hi',
        ctaColor: '#fafafa',
        ctaTextColor: '#000000',
      })
    ).toBe(
      'truecallersdk://truesdk/web_verify?type=btmsheet&partnerKey=MMN4x1fd6bf2425fe426bb911b53abfd4ed50&partnerName=Razorpay%20Checkout&lang=hi&loginPrefix=proceed&loginSuffix=verifymobile&ctaPrefix=getstarted&ctaColor=%23fafafa&ctaTextColor=%23000000&btnShape=rectangular&skipOption=useanothernum&requestNonce=00000000'
    );
  });
});
