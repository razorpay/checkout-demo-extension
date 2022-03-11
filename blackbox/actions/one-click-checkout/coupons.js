const { delay } = require('../../util');

function getCouponResponse(isValidCoupon, discountAmount, personalised) {
  if (personalised) {
    return {
      failure_reason: 'User email is required',
      failure_code: 'LOGIN_REQUIRED',
    };
  }
  const successResp = {
    promotions: [
      {
        reference_id: 'WELCOME10',
        type: 'percentage',
        code: 'WELCOME10',
        value: discountAmount,
        value_type: 'number',
        description:
          'Apply code WELCOME10 & get 10% off on your first Rowdy purchase',
      },
    ],
  };

  const failureResp = {
    failure_code: 'INVALID_PROMOTION',
    failure_reason: 'Coupon code is not valid',
  };

  return isValidCoupon ? successResp : failureResp;
}

async function applyCoupon(context, code = 'WELCOME10') {
  await context.page.waitForSelector('.coupon-input-container');
  await context.page.type('#coupon-input', code);
  await context.page.click('.coupon-apply-btn');
}

async function applyAvailableCoupon(context) {
  await context.page.waitForSelector('.available-coupons-container');
  await context.page.click('#coupon-item-apply');
}

async function handleCouponView(context) {
  await context.page.waitForSelector('.coupon-arrow-next');
  await context.page.click('.coupon-arrow-next');
}

async function handleApplyCouponReq(
  context,
  isValidCoupon,
  discountAmount,
  personalised
) {
  const req = await context.expectRequest();
  expect(req.method).toBe('POST');
  expect(req.url).toContain('coupon/apply');
  const status = isValidCoupon ? 200 : 400;
  await context.respondJSON(
    getCouponResponse(isValidCoupon, discountAmount, personalised),
    status
  );
}

async function getOrderSummary(context, isValidCoupon) {
  await context.page.waitForSelector('.coupon-order-summary');
  const orderInfo = await context.page.$eval(
    '.coupon-order-summary',
    (element, isValidCoupon) => {
      const priceEle = element.getElementsByClassName('row')[0];
      const price = priceEle.getElementsByTagName('p')[1].innerText;
      if (isValidCoupon) {
        const couponEle = element.getElementsByClassName('row')[1];
        const discountPrice = couponEle.getElementsByTagName('p')[1].innerText;
        const totalEle = element.getElementsByClassName('row')[2];
        const total = totalEle.getElementsByTagName('p')[1].innerText;
        return { price, discountPrice, total };
      } else {
        const totalEle = element.getElementsByClassName('row')[1];
        const total = totalEle.getElementsByTagName('p')[1].innerText;
        return { price, total };
      }
    },
    isValidCoupon
  );

  return orderInfo;
}

async function verifyValidCoupon(context, features) {
  const { amount, discountAmount, availableCoupons, couponCode } = features;
  if (availableCoupons) {
    applyAvailableCoupon(context);
  } else {
    applyCoupon(context, couponCode);
  }
  await delay(200);
  handleApplyCouponReq(context, true, discountAmount);
  const { price, discountPrice, total } = await getOrderSummary(context, true);
  expect(price).toEqual(`₹ ${amount / 100}`);
  expect(discountPrice).toEqual(`- ₹ ${discountAmount / 100}`);
  const calcTotalAmount = Math.abs(amount / 100 - discountAmount / 100);
  expect(total).toEqual(`₹ ${calcTotalAmount}`);
}

async function verifyInValidCoupon(context, amount) {
  applyCoupon(context);
  await delay(200);
  handleApplyCouponReq(context);
  await context.page.waitForSelector('#error-feedback');
  expect(
    await context.page.$eval('#error-feedback', (el) => el.innerText)
  ).toEqual('Coupon code is not valid');
  await delay(400);
  await context.page.waitForSelector('.back');
  await context.page.click('.back');
  await delay(200);
  const { price, total } = await getOrderSummary(context);
  expect(price).toEqual(`₹ ${amount / 100}`);
  expect(total).toEqual(`₹ ${amount / 100}`);
}

async function handleAvailableCouponReq(context, availableCoupons = []) {
  const req = await context.expectRequest();
  expect(req.method).toBe('POST');
  expect(req.url).toContain('merchant/coupons');
  await context.respondJSON({ promotions: availableCoupons });
}

async function handleRemoveCouponReq(context) {
  await context.getRequest('coupon/remove');
  const req = await context.expectRequest();
  expect(req.method).toBe('POST');
  expect(req.url).toContain('coupon/remove');
  await context.respondJSON([]);
}

async function removeCoupon(context) {
  await context.page.waitForSelector('.coupon-remove-text');
  await context.page.click('.coupon-remove-text');
}

async function handleRemoveCoupon(context, amount) {
  await delay(600);
  removeCoupon(context);
  handleRemoveCouponReq(context);
  await delay(200);
  const { price, total } = await getOrderSummary(context);
  expect(price).toEqual(`₹ ${amount / 100}`);
  expect(total).toEqual(`₹ ${amount / 100}`);
}

async function handleFillUserDetails(context, contact, email) {
  await context.page.waitForSelector('.details-container');
  await context.page.type('#overlay-wrap #contact', contact);
  await context.page.type('#overlay-wrap #email', email);
  await context.page.click('.button.details-verify-button');
}

module.exports = {
  verifyValidCoupon,
  verifyInValidCoupon,
  handleAvailableCouponReq,
  handleRemoveCoupon,
  applyCoupon,
  handleApplyCouponReq,
  handleFillUserDetails,
  handleCouponView,
};
