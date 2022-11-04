const { delay, assertVisible, makeJSONResponse } = require('../../util');
const { getDataAttrSelector, formatTextToNumber } = require('./common');
const { handlePartialOrderUpdate } = require('./order');

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

async function applyAvailableCoupon(context, couponCode) {
  const applyCta = await getDataAttrSelector(context, `coupon-${couponCode}`);
  await applyCta.click();
}

async function handleCouponView(context) {
  const goToCouponsCta = await context.page.waitForSelector(
    '#coupons-available-container'
  );
  await goToCouponsCta.click();
}

async function handleApplyCouponReq(
  context,
  isValidCoupon,
  discountAmount,
  personalised
) {
  let req = context.getRequest('/v1/merchant/coupon/apply');
  const status = isValidCoupon ? 200 : 400;
  const responseBody = getCouponResponse(
    isValidCoupon,
    discountAmount,
    personalised
  );
  if (!req) {
    req = await context.expectRequest();
    expect(req.method).toBe('POST');
    expect(req.url).toContain('coupon/apply');
    await context.respondJSON(responseBody, status);
    return;
  }
  req.respond(makeJSONResponse(responseBody, status));
  context.resetRequest(req);
}

async function getOrderSummary(context, isValidCoupon) {
  const orderSummaryEle = await getDataAttrSelector(context, 'order-summary');

  const orderInfo = await context.page.evaluate(
    (element, isValidCoupon) => {
      const cartAmount = element.querySelector(
        '[data-test-id=cart-amount]'
      ).innerText;
      if (isValidCoupon) {
        const totalAmount = element.querySelector(
          '[data-test-id=total-amount]'
        ).innerText;
        const discountAmount = element.querySelector(
          '[data-test-id=discount-amount]'
        ).innerText;
        return {
          cartAmount,
          discountAmount,
          totalAmount,
        };
      } else {
        return { cartAmount };
      }
    },
    orderSummaryEle,
    isValidCoupon
  );

  return orderInfo;
}

async function verifyValidCoupon(context, features) {
  const {
    amount,
    discountAmount,
    availableCoupons,
    couponCode,
    showCoupons,
    prefill,
  } = features;
  if (!prefill) {
    if (availableCoupons && showCoupons) {
      await applyAvailableCoupon(context, couponCode);
    } else {
      await applyCoupon(context, couponCode);
    }
  }
  await delay(200);
  await handleApplyCouponReq(context, true, discountAmount);
  const {
    cartAmount,
    discountAmount: _discountAmount,
    totalAmount,
  } = await getOrderSummary(context, true);
  expect(formatTextToNumber(cartAmount)).toEqual(amount / 100);
  expect(formatTextToNumber(_discountAmount)).toEqual(discountAmount / 100);
  const calcTotalAmount = Math.abs(amount / 100 - discountAmount / 100);
  expect(formatTextToNumber(totalAmount)).toEqual(calcTotalAmount);
}

async function verifyInValidCoupon(context, amount) {
  applyCoupon(context);
  await delay(200);
  handleApplyCouponReq(context);
  await context.page.waitForSelector('[data-test-id=error-feedback]');
  await assertVisible('[data-test-id=error-feedback]');
  await delay(400);
  await context.page.waitForSelector('.back');
  await context.page.click('.back');
  await delay(200);
  const { cartAmount } = await getOrderSummary(context);
  expect(formatTextToNumber(cartAmount)).toEqual(amount / 100);
}

async function handleAvailableCouponReq(context, availableCoupons = []) {
  let req = context.getRequest('/v1/merchant/coupons');
  if (!req) {
    req = await context.expectRequest();
    expect(req.url).toContain('merchant/coupons');
    expect(req.method).toBe('POST');
    await context.respondJSON({ promotions: availableCoupons });
    return;
  }
  req.respond(makeJSONResponse({ promotions: availableCoupons }));
  context.resetRequest(req);
}

async function handleRemoveCouponReq(context) {
  await context.getRequest('/v1/coupon/remove');
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
  const { cartAmount } = await getOrderSummary(context);
  expect(formatTextToNumber(cartAmount)).toEqual(amount / 100);
}

async function handleFillUserDetails(context, contact, email) {
  await context.page.waitForSelector('.details-container');
  await context.page.type('#overlay #contact', contact);
  await context.page.focus('#overlay #email');
  await handlePartialOrderUpdate(context);
  await context.page.type('#overlay #email', email);
  await context.page.focus('#overlay #contact');
  await handlePartialOrderUpdate(context);
  await context.page.click('.button.details-verify-button');
}

async function verifyAutoFetchDisabled(context) {
  const el = await context.page.$('.coupons-available-count');
  expect(el).toBeFalsy();
}

async function verifyCouponWidgetHidden(context) {
  const el = await context.page.$('#coupons-available-container');
  expect(el).toBeFalsy();
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
  verifyAutoFetchDisabled,
  verifyCouponWidgetHidden,
};
