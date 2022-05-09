import {
  isInternationalInPreferredInstrument,
  getInternationalProviderName,
  updateInternationalProviders,
} from '../helper';

describe('Test isInternationalInPreferredInstrument', () => {
  test('should return true if preferred instrument is international', () => {
    expect(
      isInternationalInPreferredInstrument({
        method: 'international',
        providers: ['trustly', 'poli'],
      })
    ).toStrictEqual(true);
    expect(
      isInternationalInPreferredInstrument({
        method: 'app',
        providers: ['trustly', 'poli'],
      })
    ).toStrictEqual(true);
    expect(
      isInternationalInPreferredInstrument({
        method: 'app',
        providers: ['poli'],
      })
    ).toStrictEqual(true);
    expect(
      isInternationalInPreferredInstrument({
        method: 'app',
        providers: ['trustly'],
      })
    ).toStrictEqual(true);
  });

  test('should return false if preferred instrument is not international', () => {
    expect(
      isInternationalInPreferredInstrument({
        method: 'wallet',
        providers: ['trustly', 'poli'],
      })
    ).toStrictEqual(false);
    expect(
      isInternationalInPreferredInstrument({
        method: 'card',
        providers: [],
      })
    ).toStrictEqual(false);
  });
});

describe('Test getInternationalProviderName', () => {
  test('should return correct provider name', () => {
    expect(
      getInternationalProviderName({
        method: 'international',
        providers: ['trustly', 'poli'],
      })
    ).toStrictEqual('trustly');
    expect(
      getInternationalProviderName({
        method: 'international',
        providers: ['poli', 'trustly'],
      })
    ).toStrictEqual('poli');
    expect(
      getInternationalProviderName({
        method: 'international',
        providers: [],
      })
    ).toStrictEqual(undefined);
  });
});

describe('Test updateInternationalProviders', () => {
  test('should update instrument method to international', () => {
    expect(
      updateInternationalProviders([
        {
          method: 'app',
          providers: ['trustly'],
        },
      ])
    ).toStrictEqual([
      {
        method: 'international',
        providers: ['trustly'],
      },
    ]);
    expect(
      updateInternationalProviders([
        {
          method: 'app',
          providers: ['poli'],
        },
        {
          method: 'card',
        },
      ])
    ).toStrictEqual([
      {
        method: 'international',
        providers: ['poli'],
      },
      {
        method: 'card',
      },
    ]);
  });
  test('should not update instrument method to international', () => {
    expect(
      updateInternationalProviders([
        {
          method: 'international',
        },
      ])
    ).toStrictEqual([
      {
        method: 'international',
      },
    ]);
    expect(
      updateInternationalProviders([
        {
          method: 'card',
        },
      ])
    ).toStrictEqual([
      {
        method: 'card',
      },
    ]);
  });
});
