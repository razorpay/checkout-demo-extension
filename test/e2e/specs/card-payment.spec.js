'use strict';
let manualCheckoutURL = '/manual-checkout.html';

describe('Card Payment', () => {
  it('Switch tab when card payment tab is clicked', () => {
    browser.url(manualCheckoutURL);
    browser.click('#rzp-button');


    // execOnFrame(() => {
    //   // jQuery('#payment-options > [tab=card]').click()
    // });
    browser.checkoutFrame();
    browser.setValue('#contact', '9884251048');
    browser.click('#payment-options > [tab=card]');
  });
});
