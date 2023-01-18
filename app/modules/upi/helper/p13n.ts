import { get } from 'svelte/store';
import { handleUPIPayments } from 'upi/payment';
import { UPI_APP_PAYMENT_SOURCES } from 'upi/constants';
import { getRecommendedAppsForUPIStack } from 'upi/features';
import { selectedUPIAppForPay } from 'checkoutstore/screens/upi';
import { showDowntimeAlert } from 'checkoutframe/downtimes/utils';
import {
  getDowntimeForUPIApp,
  definePlatformReturnMethodIdentifier,
} from 'upi/helper';
import { MetaProperties, Events } from 'analytics';
import { getInstrumentMeta } from 'ui/tabs/home/instruments';

import type { InstrumentType } from 'home/analytics/types';

const onAppClickDefiner = definePlatformReturnMethodIdentifier();

export function handlep13nUpiIntent(instrument: InstrumentType) {
  const isUpiIntentInstrumentFromP13nSection =
    instrument.section === 'p13n' &&
    instrument?.method === 'upi' &&
    instrument?.flows?.[0] === 'intent';

  const selectedAppPackageName = instrument?.apps?.[0];

  if (!isUpiIntentInstrumentFromP13nSection || !selectedAppPackageName) {
    return;
  }

  const supportedApps = getRecommendedAppsForUPIStack(false);

  const app: UPI.AppConfiguration | undefined = supportedApps.find(
    (supportedApp) => supportedApp.package_name === selectedAppPackageName
  );

  if (!app) {
    return;
  }

  const action = onAppClickDefiner(app);

  const appForPay: UPI.UpiAppForPay = {
    app,
    downtimeConfig: getDowntimeForUPIApp(app, true),
  };

  const downtimeSevere =
    appForPay.downtimeConfig && appForPay.downtimeConfig.severe;
  const { app_name, name } = (appForPay.app || {}) as UPI.AppConfiguration;

  // selectedUPIAppForPay is very tightly coupled with handleUPIPayments implementation
  // also, selectedUPIAppForPay is used to show the selected app in UPIAppStack
  // but now, we are also triggering handleUPIPayments from p13n block
  // that needs to set selectedUPIAppForPay but UPIAppStack component
  // should not show the app as selected if this is set from somewhere else
  // so setting a new property called source, and if source is something
  // that UPIAppStack has not set, then it'll not update the UI as well
  appForPay.source = UPI_APP_PAYMENT_SOURCES.p13n;

  appForPay.shouldShowDowntimeAlert = downtimeSevere === 'high';

  appForPay.callbackOnPay = () => {
    const selectedUPIApp = get(selectedUPIAppForPay);
    if (selectedUPIApp.shouldShowDowntimeAlert) {
      showDowntimeAlert(name || app_name);
      selectedUPIAppForPay.set({
        ...selectedUPIApp,
      });
    } else {
      try {
        // Adding same meta as added in session.js
        Events.setMeta(MetaProperties.DONE_BY_P13N, true);
        Events.setMeta(MetaProperties.DONE_BY_INSTRUMENT, true);
        Events.setMeta(
          MetaProperties.INSTRUMENT_META,
          getInstrumentMeta(instrument)
        );
      } catch (error) {
        // no-op
      }
      handleUPIPayments({ action, app });
    }
  };

  selectedUPIAppForPay.set(appForPay);
}
