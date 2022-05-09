const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
const {
  openVernacularFromHeader,
  selectLanguage,
  assertVernacularString,
} = require('../../actions/one-click-checkout/vernacular');
const { delay } = require('../../util.js');
const { scrollToEnd } = require('../../actions/one-click-checkout/common.js');
const {
  openAccounTab,
  openVernacularFromAccountTab,
} = require('../../actions/one-click-checkout/account-tab');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    testFeatures
  );

  const { openFromHeader, openFromAccountTab, languageToTest } = features;

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )('One Click Checkout Vernacular test', ({ preferences, title, options }) => {
    test.skip(title, async () => {
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });

      if (openFromHeader) {
        await openVernacularFromHeader(context);
      } else if (openFromAccountTab) {
        const screenEle = await context.page.waitForSelector('.screen-comp');
        await scrollToEnd(context, screenEle);
        await delay(800);
        await scrollToEnd(context, screenEle);
        await delay(200);
        await openAccounTab(context);
        await openVernacularFromAccountTab(context);
        await delay(400);
      }
      await selectLanguage(context, languageToTest);
      await delay(200);
      await assertVernacularString(context, languageToTest);
    });
  });
};
