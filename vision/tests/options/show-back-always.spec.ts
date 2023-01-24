import { test } from '../../core';

test('show_back_always {true} - back button visible at contact detail screen', async ({
  page,
  util,
}) => {
  await util.openCheckout({
    options: util.prepareOptions({
      theme: {
        show_back_always: true,
      },
    }),
  });
  await util.matchScreenshot();
  // click back button should close the checkout
  await page.click('.left-section .back');
  await util.matchScreenshot();
});

test("show_back_always {false} - back button shouldn't visible at contact detail screen", async ({
  util,
}) => {
  await util.openCheckout({
    options: util.prepareOptions({
      theme: {
        show_back_always: false,
      },
    }),
  });
  await util.matchScreenshot();
});
