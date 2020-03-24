const { getTestData } = require('../../../actions');

const { assertBasicDetailsScreen, assertTextContent } = require('../actions');

const { openCheckoutWithNewHomeScreen } = require('../open');

const merchantName = 'Flee Market';
const merchantDesc = 'Lost of stuff that is almost free';
const merchantImage = 'http://i.imgur.com/n5tjHFD.png';

describe.each(
  getTestData('check merchant name, desc and image in options', {
    loggedIn: false,
    preferences: {},
    options: {
      name: merchantName,
      description: merchantDesc,
      image: merchantImage,
    },
    keyless: false,
  })
)('Options tests', ({ preferences, title, options }) => {
  test(title, async () => {
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options,
      preferences,
    });

    await assertBasicDetailsScreen(context);
    await assertTextContent(context, '#merchant-name', merchantName);
    await assertTextContent(context, '#merchant-desc', merchantDesc);
    const imageElement = await context.page.waitForSelector('#logo>img');
    const hasAttribute = await context.page.evaluate(
      (imageElement, attr) => imageElement.getAttribute(attr),
      imageElement,
      'src'
    );
    expect(hasAttribute).toBe(merchantImage);
  });
});
