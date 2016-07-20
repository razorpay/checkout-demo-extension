'use strict';
let manualCheckoutURL = '/manual-checkout.html';

before(() => {
  browser.url(manualCheckoutURL);
  browser.click('#rzp-button');
});

describe('Card Payment', () => {
  it('Switch tab when card payment tab is clicked', () => {
    browser.checkoutFrame();
    browser.setValue('#contact', '9884251048');
    browser.click('#payment-options > [tab=card]');
    browser.debug();
  });
});
