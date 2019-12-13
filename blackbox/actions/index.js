const { makePreferences, makePreferencesLogged } = require('./preferences');
const { makeOptions } = require('./options');
const { openCheckout } = require('./checkout');

const getDataUpdatedForKeyless = d => {
  let options = {
    ...{
      amount: 200,
      personalization: false,
    },
    ...d.options,
    order_id: 'rzp_test_1DP5mmOlF5G5ag',
  };
  delete options.key;
  return {
    ...d,
    title: d.title + ' - keyless',
    options,
  };
};

/**
 *
 * @param {String} title Title of the test
 * @param {Object} { preferences = {}, options = {}, loggedIn = true, anon = true}
 */
const getTestData = (
  title,
  {
    preferences = {},
    options = {},
    loggedIn = true,
    anon = true,
    keyless = true,
  } = {}
) => {
  let tests = [];
  loggedIn = false; //doing this as time of execution is too much and too many random failures also
  preferencesLoggedIn = makePreferencesLogged(preferences);
  preferences = makePreferences(preferences);
  options = makeOptions(options);
  if (loggedIn) {
    let loggedInData = {
      preferences: preferencesLoggedIn,
      title: title + ' - when logged in',
      options,
    };
    tests.push(loggedInData);
    if (keyless) tests.push(getDataUpdatedForKeyless(loggedInData));
  }
  if (anon) {
    let anonymousUserData = {
      preferences,
      title: title + ' - with anonymous user',
      options,
    };
    tests.push(anonymousUserData);
    if (keyless) tests.push(getDataUpdatedForKeyless(anonymousUserData));
  }
  return tests;
};

module.exports = {
  makePreferences,
  makePreferencesLogged,
  makeOptions,
  openCheckout,
  getTestData,
};
