import Analytics from 'analytics';
import { getDowntimes, checkDowntime } from 'checkoutframe/downtimes';

export * from 'upi/helper/common';
export * from 'upi/constants';
import { UPI_APPS } from 'upi/constants';
/**
 * Returns the package name corresponding to the app shortcode.
 * @param {string} shortcode
 *
 * @returns {string | undefined}
 */
export function getPackageNameFromShortcode(shortcode) {
  const app = getAllApps().find((app) => app.shortcode === shortcode);

  if (app) {
    return app.package_name;
  }
}

/**
 * Returns the app corresponding to the package name.
 * @param {string} shortcode
 *
 * @returns {string | undefined}
 */
export function getAppFromPackageName(packageName) {
  const app = getAllApps().find((app) => app.package_name === packageName);

  return app;
}

export function getOtherAppsLabel(showableApps) {
  return showableApps.length > 0
    ? 'other_intent_upi_apps'
    : 'other_intent_apps';
}

/**
 * Order of apps.
 */
const UPI_APPS_ORDER = ['preferred', 'whitelist'];

export const otherAppsIcon =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNNCA4aDRWNEg0djR6bTYgMTJoNHYtNGgtNHY0em0tNiAwaDR2LTRINHY0em0wLTZoNHYtNEg0djR6bTYgMGg0di00aC00djR6bTYtMTB2NGg0VjRoLTR6bS02IDRoNFY0aC00djR6bTYgNmg0di00aC00djR6bTAgNmg0di00aC00djR6IiBmaWxsPSIjYjBiMGIwIi8+PHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==';

/**
 * Returns the list of all non-blacklisted apps.
 *
 * @return {Array}
 */
const getUsableApps = () => {
  let apps = [];

  UPI_APPS_ORDER.forEach((group) => {
    apps = apps.concat(UPI_APPS[group]);
  });

  return apps;
};

/**
 * Returns the list of all apps.
 *
 * @return {Array}
 */
const getAllApps = () => {
  let apps = [];

  Object.keys(UPI_APPS).forEach((group) => {
    apps = apps.concat(UPI_APPS[group]);
  });

  return apps;
};

/**
 * Returns a list of sorted apps to use.
 * @param {Array} allApps `getUPIIntentApps().filtered`
 *
 * @return {Array}
 */
export const getSortedApps = (allApps) => {
  allApps = _Obj.clone(allApps);

  const isAppInstalled = (package_name) =>
    allApps.some((app) => app.package_name === package_name);

  // Get list of package names
  let usableApps = getUsableApps();

  allApps.forEach((app, i) => {
    const appConfig = usableApps.find((usableApp) => {
      if (app.package_name) {
        return app.package_name === usableApp.package_name;
      } else if (app.shortcode) {
        return app.shortcode === usableApp.shortcode;
      }
      return false;
    });

    if (appConfig) {
      allApps[i] = _Obj.extend(allApps[i], appConfig);
    }
  });

  // Filter out apps which are installed, but the user isn't registered on them.
  // The check is only performed if verify_registration is true for the app.
  // See UPI_APPS.whitelist.
  if (global.CheckoutBridge && global.CheckoutBridge.isUserRegisteredOnUPI) {
    usableApps = usableApps.filter((app) => {
      // Only check for user registration if app is installed.
      if (app.verify_registration && isAppInstalled(app.package_name)) {
        return global.CheckoutBridge.isUserRegisteredOnUPI(app.package_name);
      }
      return true;
    });
  }

  const usablePackages = usableApps.map((app) => app.package_name);

  // Remove blacklisted apps
  allApps = allApps.filter(
    (app) => usablePackages.indexOf(app.package_name) >= 0
  );
  allApps = allApps.map((item) => {
    const currDowntime = checkDowntime(
      getDowntimes().upi,
      'psp',
      item.shortcode
    );
    if (currDowntime) {
      item.downtimeSeverity = currDowntime;
      item.downtimeInstrument = item.shortcode;
    }
    return item;
  });

  // Sort remaining apps
  allApps.sort(
    (a, b) =>
      usablePackages.indexOf(a.package_name) -
      usablePackages.indexOf(b.package_name)
  );

  return allApps;
};

/**
 * Looks for apps that are not known to Checkout and reports them.
 * @param {Array} allApps
 */
export const findAndReportNewApps = (allApps) => {
  const usablePackages = getUsableApps().map((app) => app.package_name);
  const blacklistedPackages = UPI_APPS.blacklist.map((app) => app.package_name);

  allApps.forEach((app) => {
    if (
      usablePackages.indexOf(app.package_name) < 0 &&
      blacklistedPackages.indexOf(app.package_name) < 0
    ) {
      Analytics.track('upi:unreported_app', {
        data: {
          app_name: app.app_name,
          package_name: app.package_name,
        },
      });
    }
  });
};

/**
 * Returns number of apps by category.
 * @param {Array} allApps
 *
 * @return {Object}
 */
export const getNumberOfAppsByCategory = (allApps) => {
  const count = {};
  const existingPackages = allApps.map((app) => app.package_name);

  _Obj.loop(UPI_APPS, (apps, key) => {
    count[key] = apps.filter(
      (app) => existingPackages.indexOf(app.package_name) >= 0
    ).length;
  });

  return count;
};

/**
 * get upi app data from handle
 *
 * @param {String} handle eg. okaxis, ybl
 *
 * @returns string url to the app icon
 */
export const getUPIAppDataFromHandle = (handle) => {
  const allUsableApps = getUsableApps();

  return (
    allUsableApps.find((app) => {
      return app.handles && app.handles.includes(handle);
    }) || {}
  );
};

/**
 * Track failure of UPI intent.
 *
 * @param {String} packageName
 */
export const trackUPIIntentFailure = (packageName) => {
  Analytics.track('upi:app:intent:cancel', {
    data: {
      package_name: packageName,
    },
  });
};

/**
 * Track app visibility in UPI intent apps list.
 * Only True-caller is tracked for now.
 * @param {Array} allApps
 */
export const trackAppImpressions = (allApps) => {
  if (allApps.find((app) => app.package_name === 'com.truecaller')) {
    Analytics.track('upi:app:truecaller:show');
  }
};
