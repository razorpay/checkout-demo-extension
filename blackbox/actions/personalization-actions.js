async function paymentMethodsSelection(context, optionNumber) {
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

async function verifyPaymentMethodText(context) {
  const localStorageData = await page.evaluate(() => {
    let json = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      json[key] = localStorage.getItem(key);
    }
    return json;
  });
  const rzp = JSON.parse(localStorageData.rzp_preffered_instruments);
  let arrayofvpas = [];
  for (let j = 0; j < rzp['4d184816'].length; j++) {
    arrayofvpas.push('UPI - ' + rzp['4d184816'][j].vpa);
  }
  await delay(1200);
  const paymentMethod = await context.page.$x('//div[@class="option-title"]');
  for (let i = 0; i < paymentMethod.length; i++) {
    const currentPaymentMethod = paymentMethod[0];
    let paymentMethodText = await context.page.evaluate(
      currentPaymentMethod => currentPaymentMethod.textContent,
      currentPaymentMethod
    );
    expect(arrayofvpas).toEqual(
      expect.arrayContaining([paymentMethodText.trim()])
    );
  }
}

async function selectPersonalizedCard(context) {
  await delay(1200);
  const personalizedCard = await context.page.$x(
    '//div[text() = "Use your ICICI Credit card"]'
  );
  await personalizedCard[0].click();
}

module.exports = {
  paymentMethodsSelection,
  verifyPaymentMethodText,
  selectPersonalizedCard,
};
