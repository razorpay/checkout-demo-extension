const bundles = require('../fixtures/bundles');
const { flatten } = require('../util');
const { assertTextContent } = require('../tests/homescreen/actions');

function getFlattenedBundle(locale) {
  const bundle = bundles[locale];
  return flatten(bundle || {});
}

async function verifyLabel(context, selector, locale, label) {
  const bundle = getFlattenedBundle(locale);
  const expectedText = bundle[label];
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
