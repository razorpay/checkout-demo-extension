async function selectPersonalizationPaymentMethod(context, optionNumber) {
  var apiOption = await context.page.$x(
    '//div[contains(@class, "option radio-option")]'
  );
  if (apiOption == undefined) {
    await delay(800);
    apiOption = await context.page.$x(
      '//div[contains(@class, "option radio-option")]'
    );
  }
  await apiOption[optionNumber - 1].click();
}

async function verifyPersonalizationText(context, paymentMode) {
  const localStorageData = await page.evaluate(() => {
    let json = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      json[key] = localStorage.getItem(key);
    }
    return json;
  });
  const rzp = JSON.parse(localStorageData.rzp_preffered_instruments);
  let paymentMethodArray = [];
  for (let j = 0; j < rzp['4d184816'].length; j++) {
    if (paymentMode === 'upi') {
      paymentMethodArray.push(paymentMode + ' - ' + rzp['4d184816'][j].vpa);
    } else if (paymentMode === 'wallet') {
      paymentMethodArray.push(
        paymentMode + ' - ' + rzp['4d184816'][j].wallet.toLowerCase()
      );
    } else if (paymentMode === 'netbanking') {
      paymentMethodArray.push(
        paymentMode +
          ' - ' +
          rzp['4d184816'][j].bank.toLowerCase().trim() +
          ' bank'
      );
    } else if (paymentMode === 'qr') {
      paymentMethodArray.push('UPI QR');
    }
  }
  await delay(1500);
  var paymentMethod = await context.page.$x('//div[@class="option-title"]');
  if (paymentMethod == undefined) {
    await delay(500);
    paymentMethod = await context.page.$x('//div[@class="option-title"]');
  }
  for (let i = 0; i < paymentMethod.length; i++) {
    const currentPaymentMethod = paymentMethod[0];
    let paymentMethodText = await context.page.evaluate(
      currentPaymentMethod => currentPaymentMethod.textContent,
      currentPaymentMethod
    );
    paymentMethodText = paymentMethodText.toLowerCase();
    if (
      context.preferences.payment_downtime &&
      context.preferences.payment_downtime.items[0].severity == 'high'
    )
      expect(paymentMethodArray).not.toEqual(
        expect.arrayContaining([paymentMethodText.trim()])
      );
    else
      expect(paymentMethodArray).toEqual(
        expect.arrayContaining([paymentMethodText.trim()])
      );
  }
}

async function selectPersonalizedCard(context) {
  await delay(1200);
  var personalizedCard = await context.page.$x(
    '//div[text() = "Use your ICICI Credit card"]'
  );
  if (personalizedCard == undefined) {
    await delay(700);
    personalizedCard = await context.page.$x(
      '//div[text() = "Use your ICICI Credit card"]'
    );
  }
  await personalizedCard[0].click();
}

module.exports = {
  selectPersonalizationPaymentMethod,
  verifyPersonalizationText,
  selectPersonalizedCard,
};
