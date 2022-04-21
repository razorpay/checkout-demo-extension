import { definePlatform } from './upi';
import {
  tryOpeningIntentUrlOniOSMWeb,
  upiPopUpForiOSMWeb,
} from './upiOniOSMWeb';

export const tryOpeningIntentUrl = (
  intentUrl: string,
  iOSMWeb = definePlatform('mWebiOS')
) => {
  if (iOSMWeb) {
    return tryOpeningIntentUrlOniOSMWeb(intentUrl);
  } else {
    const upiPopup = window.open(intentUrl, '_blank');
    return new Promise((resolve) => {
      if (upiPopUpForiOSMWeb.instance) {
      } else {
        setTimeout(() => {
          // Checking if we have a window instance available
          if (upiPopup) {
            if (upiPopup.closed) {
              // if upiPopUp is autoclosed , that indicates
              // that upi apps are detected and andriod system has
              //  opened available apps screen
              resolve(true);
            } else {
              // if the upiPopUp is not closed , which means there are no upi apps
              // in this case we resolve false and close the window manually and
              //  display upi no apps error message
              upiPopup.close();
              resolve(false);
            }
          } else {
            // This case is to handle for MWEB in case of firefox
            // Edge case where window instance is not returned and if there are
            // upi apps andriod system opens it or if there are no apps we don't show
            // any error message
            resolve(true);
          }
        }, 2000); // setting timeout of 2 seconds based on general testing
      }
    });
  }
};
