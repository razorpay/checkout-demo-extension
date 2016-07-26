'use strict';

let currentTabId, data;

before(() => {
  currentTabId = browser.getCurrentTabId();
  browser.frameParent();
  data = browser.exec(() => {
    return options;
  }).value;
  browser.checkoutFrame();
});

function switchToPopup() {
  let allTabs = browser.getTabIds();
  allTabs.splice(allTabs.indexOf(currentTabId), 1);
  let popup = allTabs[0];
  browser.switchTab(popup);
}

describe('Direct pay', () => {
  it('Open popup', () => {
    browser.click('#footer');
    browser.waitUntil(() => {
      return (browser.getTabIds() || []).length === 2;
    }, 1000);

    let allTabs = browser.getTabIds();
    assert.equal(allTabs.length, 2, 'Popup is opened');
  });

  it('Shows loading indicator in the modal', () => {
    assert.equal(
      browser.css('#modal-inner #error-message', 'display'),
      'block',
      'Loading is shown inside the modal'
    );

    assert.equal(
      browser.css('#modal-inner #overlay', 'display'),
      'block',
      'Loading overlay is shown inside the modal'
    );

    assert.equal(
      browser.getText('#fd-t'),
      'Your payment is being processed',
      'Loading text is shown'
    );

    // assert.equal(
    //   browser.css('#modal-inner #error-message #spin', 'display'),
    //   'block',
    //   'Loading spinner is shown'
    // );
  });

  it('Check the info displayed in the popup', () => {
    switchToPopup();
    assert.equal(
      browser.getAttribute('#top > img', 'src'),
      data.image,
      'Image loaded in the popup'
    );

    assert.equal(
      browser.getText('#top > span'),
      `₹${Number(data.amount)/100}`,
      'Amount is shown in the popup'
    );
  });

  it('Popup is closed & handler function is called', () => {
    browser.waitUntil(() => {
      return (browser.getTabIds() || []).length === 1;
    }, 5000, 'Awaiting for server\'s response', 1000);

    assert.equal(browser.getTabIds().length, 1, 'Popup is closed');

    browser.switchTab(currentTabId);
    browser.pause(300);
    let response = JSON.parse(browser.alertText());
    assert.isOk(
      response.razorpay_payment_id,
      'Handler function is passed with `razorpay_payment_id`'
    );

    browser.alertAccept();
  });
});
