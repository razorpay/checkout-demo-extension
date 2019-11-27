async function selectPersonalizationPaymentMethod(context, optionNumber) {
  const text = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('.option-title'),
      element => element.textContent
    )
  );
  const apiOption = await context.page.$x(
    '//div[contains(@class, "option radio-option")]'
  );
  await apiOption[optionNumber - 1].click();
}

async function selectPersonalizedCard(context) {
  await delay(1200);
  const personalizedCard = await context.page.$x(
    '//div[text() = "Use your ICICI Credit card"]'
  );
  await personalizedCard[0].click();
}

async function verifyPersonalizationPaymentMethodsText(
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
  selectPersonalizationPaymentMethod,
  verifyPersonalizationPaymentMethodsText,
  selectPersonalizedCard,
};
