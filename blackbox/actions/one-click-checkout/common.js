const { selectPaymentMethod } = require('../../tests/homescreen/homeActions');
const { selectQRScanner } = require('../../tests/homescreen/actions');
const { respondToUPIAjax, responseWithQRImage } = require('../../actions/common');
const {
  delay,
  assertVisible,
  setState,
  makeJSONResponse,
  assertHidden,
} = require('../../util');
const { passRequestNetbanking } = require('../common');
const { fillUserDetails } = require('../home-page-actions');
const { selectBank, handleMockSuccessDialog } = require('../shared-actions');

function getVerifyOTPResponse(inValidOTP, addresses = [], mandatoryLogin) {
  let successAddresses;

  if (addresses.length) {
    successAddresses = addresses;
  } else if (mandatoryLogin) {
    successAddresses = [];
  } else {
    successAddresses = [
      {
        id: 'ISXW2w9b7WcgMA',
        entity_id: 'IPmBz5KJ03rXr3',
        entity_type: 'customer',
        line1: 'Gandhi nagar',
        line2: 'MG Road',
        city: 'Bengaluru',
        zipcode: '560001',
        state: 'Karnataka',
        country: 'in',
        type: 'shipping_address',
        primary: true,
        deleted_at: null,
        created_at: 1638433514,
        updated_at: 1638433514,
        tag: '',
        landmark: 'test land',
        name: 'Razorpay',
        contact: '+919952398433',
      },
    ];
  }
  const successResp = {
    success: 1,
    session_id: 'IU7w1z3PBZnA6O',
    addresses: successAddresses,
  };

  const failureResp = {
    error: {
      code: 'BAD_REQUEST_ERROR',
      description: 'Verification failed because of incorrect OTP.',
      source: 'NA',
      step: 'NA',
      reason: 'NA',
      metadata: {},
    },
  };

  return inValidOTP ? failureResp : successResp;
}

async function handleCustomerStatusReq(context, saved_address = false) {
  let req = context.getRequest(
    `/v1/customers/status/+91${context.state.contact}`
  );
  if (!req) {
    const req = await context.expectRequest();
    expect(req.url).toContain('customers/status');
    expect(req.method).toBe('GET');
    await context.respondJSON({
      saved: saved_address,
      saved_address,
    });
    return;
  }
  req.respond(
    makeJSONResponse({
      saved: saved_address,
      saved_address,
    })
  );
  context.resetRequest(req);
}

async function handleUpdateOrderReq(context, orderId) {
  await context.getRequest(`/v1/orders/1cc/${orderId}/customer`);
  const req = await context.expectRequest();
  expect(req.method).toBe('PATCH');
  expect(req.url).toContain('orders/1cc');
  await context.respondJSON([]);
}

async function handleCreateOTPReq(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('otp/create');
  expect(req.method).toBe('POST');
  await context.respondJSON({ success: false });
}

async function handleVerifyOTPReq(context, inValidOTP = false, options = {}) {
  await context.getRequest('/v1/otp/verify');
  const req = await context.expectRequest();
  expect(req.method).toBe('POST');
  expect(req.url).toContain('otp/verify');
  await context.respondJSON(
    getVerifyOTPResponse(inValidOTP, options.addresses, options.mandatoryLogin)
  );
}

async function handleThirdWatchReq(context, isThirdWatchEligible = false) {
  await context.getRequest(`/v1/1cc/check_cod_eligibility`);
  const req = await context.expectRequest();
  expect(req.url).toContain('1cc/check_cod_eligibility');
  expect(req.method).toBe('POST');
  await context.respondJSON({ cod: isThirdWatchEligible });
  await delay(200);
}

async function getSummaryInfo(context, isValidCoupon, codFee) {
  const summaryModalEle = await getDataAttrSelector(context, 'summary-modal');
  const orderInfo = await context.page.evaluate(
    (element, isValidCoupon, codFee) => {
      const cartAmount = element.querySelector(
        '[data-test-id=cart-amount]'
      ).innerText;
      const shippingAmount = element.querySelector(
        '[data-test-id=shipping-amount]'
      ).innerText;
      const totalAmount = element.querySelector(
        '[data-test-id=total-amount]'
      ).innerText;

      if (isValidCoupon) {
        const discountAmount = element.querySelector(
          '[data-test-id=discount-amount]'
        ).innerText;
        const couponText = element.querySelector(
          '[data-test-id=applied-coupon-label]'
        ).innerText;

        return {
          cartAmount,
          discountAmount,
          totalAmount,
          couponText,
          shippingAmount,
        };
      } else if (codFee) {
        const codAmount = element.querySelector(
          '[data-test-id=cod-amount]'
        ).innerText;

        return { cartAmount, codAmount, totalAmount, shippingAmount };
      } else {
        return { cartAmount, totalAmount, shippingAmount };
      }
    },
    summaryModalEle,
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
    const viewDetailsCta = await getDataAttrSelector(
      context,
      'cta-view-details'
    );
    viewDetailsCta.click();
  }
  await context.page.waitForSelector('.summary-modal');
  const { shippingFee, codFee } = context.state;
  if (couponValid && !removeCoupon) {
    const {
      cartAmount,
      discountAmount: _discountAmount,
      totalAmount,
      couponText,
      shippingAmount,
    } = await getSummaryInfo(context, couponValid);
    if (!shippingFee) {
      expect('FREE').toEqual(shippingAmount);
    }
    expect(formatTextToNumber(cartAmount)).toEqual(amount / 100);
    expect(`Coupon (${couponCode})`).toEqual(couponText);
    expect(formatTextToNumber(_discountAmount)).toEqual(discountAmount / 100);
    const calcTotalAmount = Math.abs(amount / 100 - discountAmount / 100);
    expect(formatTextToNumber(totalAmount)).toEqual(calcTotalAmount);
  } else if (isSelectCOD) {
    const { cartAmount, totalAmount, shippingAmount, codAmount } =
      await getSummaryInfo(context, false, codFee);
    if (!shippingFee) {
      expect('FREE').toEqual(shippingAmount);
    }
    expect(formatTextToNumber(cartAmount)).toEqual(amount / 100);
    expect(formatTextToNumber(codAmount)).toEqual(codFee / 100);
    expect(formatTextToNumber(totalAmount)).toEqual(
      amount / 100 + codFee / 100
    );
  } else {
    const { cartAmount, totalAmount, shippingAmount } = await getSummaryInfo(
      context
    );
    let totalAmtWithShipping;
    if (shippingFee) {
      totalAmtWithShipping = Number(shippingAmount.slice(1)) + amount / 100;
    } else {
      expect('FREE').toEqual(shippingAmount);
    }
    expect(formatTextToNumber(cartAmount)).toEqual(amount / 100);
    expect(formatTextToNumber(totalAmount)).toEqual(
      totalAmtWithShipping || amount / 100
    );
  }
  if (isSelectCOD) {
    await context.page.click('.summary-modal-cta');
  } else {
    await context.page.click('.summary-close');
  }
}

async function handleTypeOTP(context, otpValue = '000008') {
  await context.page.waitForSelector('#otp-input');
  for (const [index, value] of otpValue.split('').entries()) {
    await context.page.type(`input[data-testid="otp[${index}]"]`, value);
  }
}

async function handleSkipOTP(context) {
  await context.page.waitForSelector('#otp-sec');
  await context.page.click('#otp-sec');
}

async function checkInvalidOTP(context) {
  await assertVisible('[data-test-id=otp-error-msg]');
  expect(await context.page.$eval('#one-cc-cta', (el) => el.disabled)).toBe(
    true
  );
}

async function checkSkipOTPHidden() {
  await assertHidden('#otp-sec');
}

function getDataAttrSelector(context, selectorValue) {
  return context.page.waitForSelector(`[data-test-id=${selectorValue}]`);
}

function scrollToEnd(context, selectorOrElem) {
  if (typeof selectorOrElem === 'string') {
    return page.$eval(selectorOrElem, (_node) =>
      _node.scrollBy(0, _node.scrollHeight)
    );
  }

  try {
    return context.page.evaluate((_node) => {
      _node.scrollBy(0, _node.scrollHeight);
    }, selectorOrElem || window);
  } catch (err) {
    return undefined;
  }
}

function formatTextToNumber(str) {
  return str ? +`${str}`.replace(/\D/g, '') : null;
}

async function proceedOneCC(context) {
  const cta = await context.page.waitForSelector('#one-cc-cta');
  await cta.click();
}

async function goBack(context) {
  const backBtn = await context.page.waitForSelector('.back');
  await backBtn.click();
}

async function handleLogoutReq(context, logoutAll) {
  let req = context.getRequest('/v1/apps/logout');
  if (!req) {
    req = await context.expectRequest();
    expect(req.url).toContain('apps/logout');
    expect(req.method).toBe('DELETE');
    expect(req.params.logout).toBe(logoutAll ? 'all' : 'app');
    await context.respondJSON([]);
    return;
  }
  req.respond(makeJSONResponse([]));
  context.resetRequest(req);
}

async function handleResetReq(context, orderId) {
  let req = context.getRequest(`/v1/orders/1cc/${orderId}/reset`);
  if (!req) {
    const req = await context.expectRequest();
    expect(req.url).toContain(`v1/orders/1cc/${orderId}/reset`);
    expect(req.method).toBe('POST');
    await context.respondJSON([]);
    return;
  }
  req.respond(makeJSONResponse([]));
  context.resetRequest(req);
}

async function login(context, options = {}) {
  await fillUserDetails(context, '9952395555');
  await delay(200);
  await proceedOneCC(context);
  await handleCustomerStatusReq(context, true);
  await handleCreateOTPReq(context);
  await handleTypeOTP(context);
  await delay(200);
  await proceedOneCC(context);
  await handleVerifyOTPReq(context, false, options);
  await handleShippingInfo(context, options);
}

async function handleWalletModalClose(context, features) {
  const { powerWalletModalClose } = features;
  if (powerWalletModalClose) {
    await selectPaymentMethod(context, 'wallet');
    await context.page.click('#wallet-radio-mobikwik');
    await proceedOneCC(context);
    await context.page.click('.modal-close');
    await delay(200);
    await context.page.click('#positiveBtn');
    await delay(400);
    const backBtn = await getDataAttrSelector(context, 'back');
    await backBtn.click();
  }
}

async function handleQRModalClose(context, features) {
  const { qrModalClose } = features;
  if (qrModalClose) {
    await selectPaymentMethod(context, 'upi');
    await selectQRScanner(context);
    await respondToUPIAjax(context, { method: 'qr' });
    await responseWithQRImage(context);
    await context.page.click('.modal-close');
    await delay(200);
    await context.page.click('#positiveBtn');
    await delay(400);
    await context.page.click('#fd-hide');
    await delay(200);
    const backBtn = await getDataAttrSelector(context, 'back');
    await backBtn.click();
  }
}

async function mockPaymentSteps(
  context,
  options,
  features,
  updateOrder = true
) {
  if (updateOrder) {
    await handleUpdateOrderReq(context, options.order_id);
  }
  await handleThirdWatchReq(context);
  await delay(200);
  await handleFeeSummary(context, features);
  await handleWalletModalClose(context, features);
  await handleQRModalClose(context, features);
  await selectPaymentMethod(context, 'netbanking');
  await selectBank(context, 'SBIN');
  await proceedOneCC(context);
  await passRequestNetbanking(context);
  await delay(200);
  await handleMockSuccessDialog(context);
  await delay(400);
}

async function closeModal(context) {
  const crossCTA = await context.page.waitForSelector('.modal-close');
  await crossCTA.click();
}

function getShippingInfoResponse({
  isCODEligible,
  serviceable = true,
  codFee = 0,
  shippingFee = 0,
  zipcode = '560001',
}) {
  const resp = {
    addresses: [
      {
        zipcode,
        country: 'in',
        city: 'Bengaluru',
        state: 'KARNATAKA',
        state_code: 'KA',
        cod: isCODEligible,
        cod_fee: codFee,
        shipping_fee: shippingFee,
        serviceable,
      },
    ],
  };

  return resp;
}
async function handleShippingInfo(context, options = {}) {
  let req = context.getRequest(`/v1/merchant/shipping_info`);
  const resp = getShippingInfoResponse(options);
  const { shipping_fee, cod_fee } = resp.addresses[0];
  const state = {
    shippingFee: shipping_fee,
  };
  if (cod_fee) {
    state.codFee = cod_fee;
  }
  setState(context, state);
  if (!req) {
    const req = await context.expectRequest();
    expect(req.method).toBe('POST');
    expect(req.url).toContain('merchant/shipping_info');
    await context.respondJSON(resp);
    return;
  }
  req.respond(makeJSONResponse(resp));
  context.resetRequest(req);
}

module.exports = {
  handleCustomerStatusReq,
  handleUpdateOrderReq,
  handleThirdWatchReq,
  handleFeeSummary,
  handleCreateOTPReq,
  handleTypeOTP,
  handleVerifyOTPReq,
  handleSkipOTP,
  checkInvalidOTP,
  checkSkipOTPHidden,
  getDataAttrSelector,
  scrollToEnd,
  formatTextToNumber,
  proceedOneCC,
  goBack,
  handleLogoutReq,
  handleResetReq,
  login,
  mockPaymentSteps,
  closeModal,
  handleShippingInfo,
};
