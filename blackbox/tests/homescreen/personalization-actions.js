async function verifyPersonalizationVPAText(context) {
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
  var paymentMethod = await context.page.$x(
    '//button[contains(@class,"p13n-instrument")]'
  );
  for (let i = 0; i < paymentMethod.length; i++) {
    const currentPaymentMethod = paymentMethod[i];

    let paymentMethodText = await context.page.evaluate(
      currentPaymentMethod => currentPaymentMethod.textContent,
      currentPaymentMethod
    );
    if (
      context.preferences.payment_downtime &&
      context.preferences.payment_downtime.items[0].severity == 'high'
    )
      expect(arrayofvpas).not.toEqual(
        expect.arrayContaining([
          paymentMethodText
            .substring(paymentMethodText.lastIndexOf('UPI'))
            .trim(),
        ])
      );
    else
      expect(arrayofvpas).toEqual(
        expect.arrayContaining([
          paymentMethodText
            .substring(paymentMethodText.lastIndexOf('UPI'))
            .trim(),
        ])
      );
  }
}

async function selectPersonalizationPaymentMethod(context, optionNumber) {
  var apiOption = await context.page.$x(
    '//button[contains(@class,"p13n-instrument")]'
  );
  await apiOption[optionNumber - 1].click();
}

module.exports = {
  verifyPersonalizationVPAText,
  selectPersonalizationPaymentMethod,
};
