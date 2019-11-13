const { makePreferences, makePreferencesLogged } = require('./preferences');
const { makeOptions } = require('./options');
const { openCheckout } = require('./checkout');

/**
 *
 * @param {String} title Title of the test
 * @param {Object} { preferences = {}, loggedIn = true, anon = true}
 */
const getTestData = (
  title,
  { preferences = {}, loggedIn = true, anon = true } = {}
) => {
  let tests = [];
  if (loggedIn) {
    tests.push({
      preferences: makePreferencesLogged(preferences),
      title: title + ' - when logged in',
    });
  }
  if (anon) {
    tests.push({
      preferences: makePreferences(preferences),
      title: title + ' - with anonymous user',
    });
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
