const makeOptionsAndPreferences = require('../../create/options');
const { openCheckoutWithNewHomeScreen } = require('../homescreen/open');
const { getTestData } = require('../../actions');

const { randomContact, randomEmail, delay } = require('../../util');

let testData = {};

describe('Open checkout with customer_id', () => {
  beforeAll(() => {
    const { preferences, options } = makeOptionsAndPreferences(
      'international-providers',
      {
        testPoli: true,
      }
    );

    testData = getTestData('', {
      options,
      preferences,
    })[0];
  });

  test('should call personalization api if customer phone number is international', async () => {
    const customerId = 'cust_randomId';
    const customerPhone = randomContact();
    const customerEmail = randomEmail();
    testData.options = {
      order_id: 'order_Id',
      customer_id: customerId,
    };
    testData.preferences.customer = {
      contact: null,
      customer_id: customerId,
      email: customerEmail,
    };
    testData.preferences.global = false;
    const context = await openCheckoutWithNewHomeScreen({
      page,
      options: testData.options,
      preferences: testData.preferences,
      method: 'card',
      personalizationDefault: true,
    });

    await context.page.type('#contact', customerPhone);
    await context.page.click('#country-code');
    await context.page.waitForSelector('.list-item');
    await delay(200);
    // select US country code
    await context.page.evaluate(() => {
      Array.from(document.querySelectorAll('.list-item')).forEach((el) => {
        if (el.id.indexOf('US_1') > -1) {
          el.click();
        }
      });
    });

    await delay(200);
    await context.page.click('#footer');

    // expect personalization api call
    await context.getRequest('/v1/personalisation');
    const req = await context.expectRequest();
    expect(req.url).toContain('/personalisation');
    await context.respondJSON({
      preferred_methods: {
        [`+1${customerPhone}`]: {
          instruments: [{ instrument: 'paypal', method: 'wallet' }],
          is_customer_identified: true,
          user_aggregates_available: false,
          versionID: 'v1',
        },
      },
      rtb_experiment: { experiment: false },
    });
  });
});
