const { assertVisible } = require('../../util');

async function confirmModalClose(context) {
  const closeCTA = await context.page.waitForSelector(
    '.confirm-buttons #positiveBtn'
  );
  await closeCTA.click();
}

async function assertModalClose(context) {
  expect(
    await context.page.evaluate(() => {
      const modalEle = document.querySelector('#modal');
      return !modalEle;
    })
  ).toBe(true);
}

async function assertAddressTab(context) {
  expect(
    await context.page.$eval('[data-test-id=breadcrumb-nav]', (ele) => {
      const tabNodes = ele.querySelectorAll('.text');
      return tabNodes[1].innerText.toLowerCase() === 'address';
    })
  ).toBe(true);
  await assertVisible('.address-tab');
}

async function assertSummaryTab(context) {
  await assertVisible('[data-test-id=summary-screen]');
}

async function assertPaymentsTab(context) {
  await assertVisible('.home-methods');
}

module.exports = {
  confirmModalClose,
  assertModalClose,
  assertAddressTab,
  assertSummaryTab,
  assertPaymentsTab,
};
