const bundles = require('../fixtures/bundles');
const { assertTextContent } = require('../tests/homescreen/actions');

async function verifyLabel(context, selector, locale, label) {
  const expectedText = bundles[locale][label];
  await assertTextContent(context, selector, expectedText);
}

async function selectLocale(context, locale) {
  await context.page.select('#language-dropdown select', locale);
}

async function respondToBundleRequest(context, locale) {
  const req = await context.expectRequest();
  expect(req.url).toContain(`${locale}.json`);
  const bundle = bundles[locale];

  if (bundle) {
    await context.respondJSON(bundles[locale]);
  } else {
    await context.failRequest('Not Found');
  }
}

module.exports = {
  respondToBundleRequest,
  verifyLabel,
  selectLocale,
};
