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
      'truecallersdk://truesdk/web_verify?type=btmsheet&partnerKey=BwwcFdf4727abe5e5441c81444ffc76764717&partnerName=Razorpay%20Checkout&lang=hi&loginPrefix=proceed&loginSuffix=verifymobile&ctaPrefix=getstarted&ctaColor=%23fafafa&ctaTextColor=%23000000&btnShape=rectangular&skipOption=useanothernum&requestNonce=00000000'
    );
  });
});
