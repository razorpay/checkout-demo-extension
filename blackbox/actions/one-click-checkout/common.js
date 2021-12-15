const { delay } = require('../../util');

async function handleCustomerStatusReq(context) {
  const req = await context.expectRequest();
  expect(req.method).toBe('GET');
  expect(req.url).toContain('customers/status');
  await context.respondJSON({
    saved: false,
    saved_address: false,
  });
}

async function handleUpdateOrderReq(context, orderId) {
  await context.getRequest(`/v1/orders/1cc/${orderId}/customer`);
  const req = await context.expectRequest();
  expect(req.method).toBe('PATCH');
  expect(req.url).toContain('orders/1cc');
  await context.respondJSON([]);
}

async function handleThirdWatchReq(context, isThirdWatchEligible = false) {
  await context.getRequest(`/v1/tw/address/check_cod_eligibility`);
  const req = await context.expectRequest();
  expect(req.method).toBe('POST');
  expect(req.url).toContain('address/check_cod_eligibility');
  await context.respondJSON({ cod: isThirdWatchEligible });
  await delay(200);
}

async function getSummaryInfo(context, isValidCoupon, codFee) {
  const orderInfo = await context.page.$eval(
    '.summary-modal',
    (element, isValidCoupon, codFee) => {
      const priceEle = element.getElementsByClassName('summary-row')[0];
      const price = priceEle.getElementsByTagName('div')[1].innerText;
      const shippingEle = element.getElementsByClassName('summary-row')[1];
      const shippingAmount =
        shippingEle.getElementsByTagName('div')[1].innerText;
      if (isValidCoupon) {
        const couponEle = element.getElementsByClassName('summary-row')[2];
        const couponText = couponEle.getElementsByTagName('div')[0].innerText;
        const discountPrice =
          couponEle.getElementsByTagName('div')[1].innerText;
        const totalEle = element.getElementsByClassName('summary-row')[3];
        const total = totalEle.getElementsByTagName('div')[1].innerText;
        return { price, discountPrice, total, couponText, shippingAmount };
      } else if (codFee) {
        const codEle = element.getElementsByClassName('summary-row')[2];
        const codAmount = codEle.getElementsByTagName('div')[1].innerText;
        const totalEle = element.getElementsByClassName('summary-row')[3];
        const total = totalEle.getElementsByTagName('div')[1].innerText;
        return { price, codAmount, total, shippingAmount };
      } else {
        const totalEle = element.getElementsByClassName('summary-row')[2];
        const total = totalEle.getElementsByTagName('div')[1].innerText;
        return { price, total, shippingAmount };
      }
    },
    isValidCoupon,
    codFee
  );

  return orderInfo;
}

async function handleFeeSummary(context, features) {
  const {
    amount,
    discountAmount,
    couponValid,
    couponCode,
    removeCoupon,
    isSelectCOD,
  } = features;
  await delay(200);
  if (!isSelectCOD) {
    await context.page.waitForSelector('.fee');
    await context.page.click('.fee');
  }
  await context.page.waitForSelector('.summary-modal');
  const { shippingFee, codFee } = context.state;
  if (couponValid && !removeCoupon) {
    const { price, discountPrice, total, couponText, shippingAmount } =
      await getSummaryInfo(context, couponValid);
    if (!shippingFee) {
      expect('FREE').toEqual(shippingAmount);
    }
    expect(price).toEqual(`₹ ${amount / 100}`);
    expect(`Coupon (${couponCode})`).toEqual(couponText);
    expect(discountPrice).toEqual(`-₹ ${discountAmount / 100}`);
    const calcTotalAmount = Math.abs(amount / 100 - discountAmount / 100);
    expect(total).toEqual(`₹ ${calcTotalAmount}`);
  } else if (isSelectCOD) {
    const { price, total, shippingAmount, codAmount } = await getSummaryInfo(
      context,
      false,
      codFee
    );
    if (!shippingFee) {
      expect('FREE').toEqual(shippingAmount);
    }
    expect(price).toEqual(`₹ ${amount / 100}`);
    expect(codAmount).toEqual(`₹ ${codFee / 100}`);
    expect(total).toEqual(`₹ ${amount / 100 + codFee / 100}`);
  } else {
    const { price, total, shippingAmount } = await getSummaryInfo(context);
    if (!shippingFee) {
      expect('FREE').toEqual(shippingAmount);
    }
    expect(price).toEqual(`₹ ${amount / 100}`);
    expect(total).toEqual(`₹ ${amount / 100}`);
  }
  if (isSelectCOD) {
    await context.page.click('.summary-modal-cta');
  } else {
    await context.page.click('.backdrop');
  }
}

module.exports = {
  handleCustomerStatusReq,
  handleUpdateOrderReq,
  handleThirdWatchReq,
  handleFeeSummary,
};
