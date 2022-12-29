import { test, expect } from '../../core';
import Options from '../../mock/options';

test('show_back_always {true} - back button visible at contact detail screen', async ({
  page,
  util,
}) => {
  const options = Options({
    theme: {
      show_back_always: true,
    },
  });
  await util.openCheckout({
    options,
  });
  await util.matchScreenshot();
  // click back button should close the checkout
  await page.click('.left-section .back');
  await util.matchScreenshot();
});

test("show_back_always {false} - back button shouldn't visible at contact detail screen", async ({
  page,
  util,
}) => {
  const options = Options({
    theme: {
      show_back_always: false,
    },
  });
  await util.openCheckout({
    options,
  });
  await util.matchScreenshot();
});
