async function paymentMethodsSelection(context) {
  const text = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('.option-title'),
      element => element.textContent
    )
  );
  const apiOption = await context.page.$x(
    '//div[contains(@class, "option radio-option")]'
  );
  await apiOption[0].click();
}

async function verifyPaymentMethodText(
  context,
  typeName,
  expectedPaymentMethod
) {
  const paymentMethod = await context.page.waitForXPath(
    '//div[contains(text(), "' + typeName + '") and @class="option-title"]'
  );
  let paymentMethodText = await context.page.evaluate(
    paymentMethod => paymentMethod.textContent,
    paymentMethod
  );
  expect(paymentMethodText.trim()).toEqual(expectedPaymentMethod);
}

module.exports = {
  paymentMethodsSelection,
  verifyPaymentMethodText,
};
