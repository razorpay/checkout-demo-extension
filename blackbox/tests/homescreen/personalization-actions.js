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
      paymentMethodArray.push('upi qr');
    }
  }
  var paymentMethod = await context.page.$$(
    '.home-methods .methods-block[data-block="rzp.preferred"] .instrument'
  );
  for (let i = 0; i < paymentMethod.length; i++) {
    const currentPaymentMethod = paymentMethod[i];

    let paymentMethodText = await context.page.evaluate(
      currentPaymentMethod => currentPaymentMethod.textContent,
      currentPaymentMethod
    );
    paymentMethodText = paymentMethodText.toLowerCase();
    if (
      context.preferences.payment_downtime &&
      context.preferences.payment_downtime.items[0].severity == 'high'
    ) {
      expect(paymentMethodArray).not.toEqual(
        expect.arrayContaining([
          paymentMethodText
            .substring(paymentMethodText.lastIndexOf('upi'))
            .trim(),
        ])
      );
    } else {
      expect(paymentMethodArray).toEqual(
        expect.arrayContaining([
          paymentMethodText
            .substring(paymentMethodText.lastIndexOf('upi'))
            .trim(),
        ])
      );
    }
  }
}

async function selectPersonalizationPaymentMethod(context, optionNumber) {
  var apiOption = await context.page.$$(
    '.home-methods .methods-block[data-block="rzp.preferred"] .instrument'
  );

  await apiOption[optionNumber - 1].click();
}

async function receiveApiInstruments(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('/personalisation');
  await context.respondJSON({});
}

module.exports = {
  verifyPersonalizationText,
  selectPersonalizationPaymentMethod,
  receiveApiInstruments,
};
