async function assertPersonalizationPage(context, typeName) {
  expect(
    await context.page.waitForXPath(
      '//*[contains(text(), "' + typeName + '") and @class="option-title"]'
    )
  ).not.toBeNull();
}

async function assertPaymentMethodsPersonalization(context) {
  const text = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('.option-title'),
      element => element.textContent
    )
  );
  await delay(2000);
  const apiOption = await context.page.$x(
    '//div[contains(@class, "option radio-option")]'
  );
  await apiOption[0].click();
}

module.exports = {
  assertPersonalizationPage,
  assertPaymentMethodsPersonalization,
};
