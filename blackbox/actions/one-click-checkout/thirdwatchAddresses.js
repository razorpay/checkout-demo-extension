const thirdwatchAddresses = require('../../data/one-click-checkout/tw_addresses.json');
const { makeJSONResponse } = require('../../util');

async function assertConsentModalVisible(context) {
  const el = await context.page.$('.consent-modal');

  expect(el).toBeTruthy();
}

async function submitOnConsentModal(context, checked = true) {
  const el = await context.page.$('.consent-modal .consent-cta');
  await el.click();
}

async function handleConsentViewApiCall(context, consentBannerViews = 2) {
  let request = context.getRequest('1cc/consent/address/view');
  if (!request) {
    request = await context.expectRequest();
    expect(request.url).toContain('1cc/consent/address/view');
    expect(request.method).toBe('PUT');
    await context.respondJSON({
      consent_banner_views: consentBannerViews,
    });
    return;
  }
  request.respond(
    makeJSONResponse({
      consent_banner_views: consentBannerViews,
    })
  );
  context.resetRequest(request);
}

async function assertConsentBannerVisible(context) {
  const el = await context.page.$('.consent-banner');
  expect(el).toBeTruthy();
}

async function navigateToAddressScreen(context) {
  const el = await context.page.$('[data-test-id=manage-address-cta]');
  await el.click();
}

async function fetchThirdwatchAddresses(context) {
  const el = await context.page.$('.banner-cta');
  await el.click();
}

async function handleConsentUpdateApiCall(context) {
  let request = context.getRequest('1cc/address/consent');
  if (!request) {
    request = await context.expectRequest();
    expect(request.url).toContain('1cc/address/consent');
    expect(request.method).toBe('PUT');
    await context.respondJSON({
      addresses: thirdwatchAddresses,
    });
    return;
  }
  request.respond(
    makeJSONResponse({
      addresses: thirdwatchAddresses,
    })
  );
  context.resetRequest(request);
}

async function assertAddressList(context, originalAddresses = []) {
  const addresses = await context.page.$$('.address-box');
  expect(addresses.length).toEqual(
    originalAddresses.length + thirdwatchAddresses.length
  );
}

async function assertConsentBannerNotVisible(context) {
  const el = await context.page.$('.consent-banner');

  expect(el).toBeFalsy();
}

module.exports = {
  assertConsentModalVisible,
  submitOnConsentModal,
  handleConsentViewApiCall,
  assertConsentBannerVisible,
  navigateToAddressScreen,
  fetchThirdwatchAddresses,
  handleConsentUpdateApiCall,
  assertAddressList,
  assertConsentBannerNotVisible,
};
