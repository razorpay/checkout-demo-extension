import { isIgnoredErrors, stringMatchesSomePattern } from '../filters';

describe('Test isIgnoredErrors', () => {
  it('Should ignore chrome extension error', () => {
    const error = {
      stack: `TypeError: Cannot read properties of null (reading 'click')
      at chrome-extension://jinjaccalgkegednnccohejagnlnfdag/test%20rapid%20click.user.js#2:12:36
      at window.VMino8uixz04kp7zjssr (chrome-extension://jinjaccalgkegednnccohejagnlnfdag/test%20rapid%20click.user.js#2:16:3)
      at a (chrome-extension://jinjaccalgkegednnccohejagnlnfdag/sandbox/injected-web.js:1:16473)
      at Lt (chrome-extension://jinjaccalgkegednnccohejagnlnfdag/sandbox/injected-web.js:1:16548)
      at set (chrome-extension://jinjaccalgkegednnccohejagnlnfdag/sandbox/injected-web.js:1:16340)
      at chrome-extension://jinjaccalgkegednnccohejagnlnfdag/test%20rapid%20click.user.js#2:1:28`,
    };
    expect(isIgnoredErrors(error)).toBe(true);
  });

  it('Should ignore mozzila extension error', () => {
    const error = {
      message: 'btnPlace is null',
      stack: `main@moz-extension://d7972059-fd5f-4d0b-aefb-9e90b5f2f376/userscripts/Scribd%20Downloader%20-%20Chrome%20Extension.user.js?id=675603bc-217d-463d-a346-d55b16f6ba72:57:5
      window[""__f__lalbmc26.kgl""]/<@moz-extension://d7972059-fd5f-4d0b-aefb-9e90b5f2f376/userscripts/Scribd%20Downloader%20-%20Chrome%20Extension.user.js?id=675603bc-217d-463d-a346-d55b16f6ba72:60:1
      wt@https://api.razorpay.com/v1/checkout/public?traffic_env=production&build=1b81cbfce23a06fe8bf91b525015d1dbe5a6a3b4:8:91
      window[""__f__lalbmc26.kgl""]/<@moz-extension://d7972059-fd5f-4d0b-aefb-9e90b5f2f376/userscripts/Scribd%20Downloader%20-%20Chrome%20Extension.user.js?id=675603bc-217d-463d-a346-d55b16f6ba72:1:89
      window[""__f__lalbmc26.kgl""]@moz-extension://d7972059-fd5f-4d0b-aefb-9e90b5f2f376/userscripts/Scribd%20Downloader%20-%20Chrome%20Extension.user.js?id=675603bc-217d-463d-a346-d55b16f6ba72:1:551
      wt@https://api.razorpay.com/v1/checkout/public?traffic_env=production&build=1b81cbfce23a06fe8bf91b525015d1dbe5a6a3b4:8:91
      set@https://api.razorpay.com/v1/checkout/public?traffic_env=production&build=1b81cbfce23a06fe8bf91b525015d1dbe5a6a3b4:79:118
      @moz-extension://d7972059-fd5f-4d0b-aefb-9e90b5f2f376/userscripts/Scribd%20Downloader%20-%20Chrome%20Extension.user.js?id=675603bc-217d-463d-a346-d55b16f6ba72:1:1
      `,
    };
    expect(isIgnoredErrors(error)).toBe(true);
  });

  it('Should ignore webkit-masked-url error', () => {
    const error = {
      message: 'Right side of assignment cannot be destructured',
      stack: `"@webkit-masked-url://hidden/:17:301035
      promiseReactionJob@[native code]"`,
    };
    expect(isIgnoredErrors(error)).toBe(true);
  });

  it('Should ignore cryto extension errors', () => {
    const error = {
      message: 'Cannot redefine property: ethereum',
      stack: `TypeError: Cannot redefine property: ethereum
      at Function.defineProperty (<anonymous>)
      at <anonymous>:1:60746`,
    };
    expect(isIgnoredErrors(error)).toBe(true);

    expect(isIgnoredErrors('Not implemented on this platform')).toBe(true);
    expect(isIgnoredErrors('chain is not set up')).toBe(true);
    expect(isIgnoredErrors('Cannot redefine property: ethereum')).toBe(true);
  });

  it('Should return false for empty values', () => {
    expect(isIgnoredErrors(undefined)).toBe(false);
    expect(isIgnoredErrors(null as any)).toBe(false);
    expect(isIgnoredErrors('')).toBe(false);
  });

  it('Should return false for non filtered out error', () => {
    const error = {
      stack: `ReferenceError: Intl is not defined
      at https://checkout-static-next.razorpay.com/build/69dc45b454a9c3c78d3694ff57de6a2bce7f4128/checkout-frame.js:1:201084
      at https://checkout-static-next.razorpay.com/build/69dc45b454a9c3c78d3694ff57de6a2bce7f4128/checkout-frame.js:1:201702
      at https://checkout-static-next.razorpay.com/build/69dc45b454a9c3c78d3694ff57de6a2bce7f4128/checkout-frame.js:1:1823605`,
    };
    expect(isIgnoredErrors(error)).toBe(false);
  });
});

describe('Test stringMatchesSomePattern', () => {
  it('Should match string for list of patterns', () => {
    const testString = 'Right side of assignment cannot be destructured';
    expect(
      stringMatchesSomePattern(testString, [
        'assignment cannot',
        'destructured',
      ])
    ).toBe(true);
    expect(
      stringMatchesSomePattern(
        testString,
        ['assignment cannot', 'destructured'],
        true
      )
    ).toBe(false);
    expect(
      stringMatchesSomePattern(
        testString,
        ['some-random-string', testString],
        true
      )
    ).toBe(true);

    expect(
      stringMatchesSomePattern(testString, [new RegExp(/assignment/, 'i')])
    ).toBe(true);
  });
});
