import {
  appsThatSupportWebPayments,
  additionalSupportedPaymentApps,
} from '../webPaymentsApi';

import { ADAPTER_CHECKERS } from 'payment/adapters';

function getPackageNamesForAppThatSupportWebPayment() {
  return appsThatSupportWebPayments.map((config) => config.package_name);
}

describe('appsThatSupportWebPayments tests', () => {
  test('should contain all the apps that support web payments', function () {
    const webPaymentApps = { ...ADAPTER_CHECKERS } as Partial<
      typeof ADAPTER_CHECKERS
    >;

    // not checking for microapps as it doesn't directly go via
    // web payments api
    delete webPaymentApps['microapps.gpay'];

    // before using additional apps
    expect(getPackageNamesForAppThatSupportWebPayment()).toEqual(
      expect.arrayContaining(Object.keys(webPaymentApps))
    );

    additionalSupportedPaymentApps();

    // after using additional apps
    expect(getPackageNamesForAppThatSupportWebPayment()).toEqual(
      expect.arrayContaining(Object.keys(webPaymentApps))
    );
  });
});
