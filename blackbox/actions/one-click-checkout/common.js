const { selectPaymentMethod } = require('../../tests/homescreen/homeActions');
const { selectQRScanner } = require('../../tests/homescreen/actions');
const {
  respondToUPIAjax,
  responseWithQRImage,
  selectUPIMethod,
  enterUPIAccount,
  handleUPIAccountValidation,
  respondToUPIPaymentStatus,
  handleSaveVpaRequest,
  enterCardDetails,
  handleCardValidation,
  typeOTPandSubmit,
} = require('../../actions/common');
const {
  delay,
  assertVisible,
  setState,
  makeJSONResponse,
  assertHidden,
} = require('../../util');
const { fillUserDetails } = require('../home-page-actions');
const {
  selectBank,
  handleMockSuccessDialog,
  submit,
} = require('../shared-actions');
const { handleGiftCard } = require('./gift-card');
const { handleCODPayment } = require('./cod');
const {
  selectSavedCardAndTypeCvv,
  handleCustomerCardStatusRequest,
  respondSavedCards,
} = require('../card-actions');

const truncateString = (str, num) =>
  str?.length > num ? `${str.slice(0, num)}...` : str;

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

async function handleCustomerStatusReq(
  context,
  saved_address = false,
  consent_banner_views = 0
) {
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
      '1cc_consent_banner_views': consent_banner_views,
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
  let request = await context.getRequest(`/v1/orders/1cc/${orderId}/customer`);
  if (!request) {
    request = await context.expectRequest();
    expect(request.url).toContain(`orders/1cc/${orderId}/customer`);
    expect(request.method).toBe('PATCH');
    await context.respondJSON([]);
    return;
  }
  request.respond(makeJSONResponse([]));
  context.resetRequest(request);
}

async function handleCreateOTPReq(context) {
  let req = context.getRequest('/v1/otp/create');
  if (!req) {
    req = await context.expectRequest();
    expect(req.url).toContain('otp/create');
    expect(req.method).toBe('POST');
    await context.respondJSON({
      success: true,
    });
    return;
  }
  req.respond(
    makeJSONResponse({
      success: true,
    })
  );
  context.resetRequest(req);
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

async function getSummaryInfo(context, isValidCoupon, codFee, features) {
  const orderInfo = await context.page.$eval(
    '[data-test-id=summary-modal]',
    (element, isValidCoupon, codFee, offersEnabled) => {
      let discountAmount;
      let couponText;
      let codAmount;
      let offerText;
      let offerAmount;

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
        discountAmount = element.querySelector(
          '[data-test-id=discount-amount]'
        )?.innerText;
        couponText = element.querySelector(
          '[data-test-id=applied-coupon-label]'
        )?.innerText;
      }

      if (codFee >= 0) {
        codAmount = element.querySelector(
          '[data-test-id=cod-amount]'
        )?.innerText;
      }

      if (offersEnabled) {
        offerText = element.querySelector(
          '[data-test-id=offer-label'
        )?.innerText;
        offerAmount = element.querySelector(
          '[data-test-id=offer-amount'
        )?.innerText;
      }

      return {
        cartAmount,
        discountAmount,
        totalAmount,
        couponText,
        shippingAmount,
        codAmount,
        offerText,
        offerAmount,
      };
    },
    isValidCoupon,
    codFee,
    features.offers
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
    offers,
    offerIndex = 1,
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
  const {
    codAmount,
    cartAmount,
    discountAmount: _discountAmount,
    totalAmount,
    couponText,
    shippingAmount,
    offerAmount,
    offerText,
  } = await getSummaryInfo(context, couponValid, codFee, features);
  if (!shippingFee) {
    expect('Free').toEqual(shippingAmount);
  }
  expect(formatTextToNumber(cartAmount)).toEqual(amount / 100);

  let expectedAmount = amount / 100;
  if (couponValid && !removeCoupon) {
    expectedAmount -= discountAmount / 100;
    expect(couponText).toEqual(`Coupon (${couponCode})`);
    if (amount === discountAmount) {
      expectedAmount = 1;
      expect(formatTextToNumber(_discountAmount) + 1).toEqual(
        discountAmount / 100
      );
    } else {
      expect(formatTextToNumber(_discountAmount)).toEqual(discountAmount / 100);
    }
  }

  if (shippingFee) {
    expectedAmount += shippingFee / 100;
  } else {
    expect(shippingAmount).toEqual('Free');
  }

  if (codFee && isSelectCOD) {
    expectedAmount += codFee / 100;
  }

  if (offers) {
    const offerDiscount =
      context.preferences.offers[offerIndex - 1].original_amount -
      context.preferences.offers[offerIndex - 1].amount;
    expectedAmount -= offerDiscount / 100;

    expect(offerText).toContain(
      truncateString(
        context.preferences.offers[offerIndex - 1].display_text,
        20
      )
    );
    expect(formatTextToNumber(offerAmount)).toEqual(offerDiscount / 100);
  }

  expect(formatTextToNumber(cartAmount)).toEqual(amount / 100);
  if (isSelectCOD && codFee > 0) {
    expect(formatTextToNumber(codAmount)).toEqual(codFee / 100);
  }
  expect(formatTextToNumber(totalAmount)).toEqual(expectedAmount);

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
  expect(
    await context.page.$eval('#redesign-v15-cta', (el) => el.disabled)
  ).toBe(false);
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
  if (typeof str !== 'string') {
    return parseInt(str);
  }
  return +`${str}`.replace(/\D/g, '');
}

async function proceedOneCC(context) {
  const cta = await context.page.waitForSelector('#redesign-v15-cta');
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
    if (features.addresses?.length > 0) {
      // for 1cc/redesign we don't have fd-hide using new errormodal
      await context.page.click('.primary-cta');
    } else {
      await context.page.click('#fd-hide');
    }
    await delay(200);
    const backBtn = await getDataAttrSelector(context, 'back');
    await backBtn.click();
  }
}

async function mockPaymentSteps(
  context,
  options,
  features,
  updateOrder = true,
  method = 'upi'
) {
  if (updateOrder) {
    await handleUpdateOrderReq(context, options.order_id);
  }
  await handleThirdWatchReq(context, true);
  await delay(200);
  if (method !== 'cod') {
    await handleFeeSummary(context, features);
    await handleGiftCard(context, features);
  }

  switch (method) {
    case 'upi':
      await makeUpiPayment(context);
      break;
    case 'card':
      await makeCardPayment(context, features);
      break;
    case 'cod':
      await makeCodPayment(context, features);
      break;
    default:
      throw Error(`unexpected method ${method} received`);
  }
}

async function makeCodPayment(context, features) {
  await selectPaymentMethod(context, 'cod');
  await delay(200);
  features.isSelectCOD = true;
  await proceedOneCC(context);
  await handleFeeSummary(context, features);
  await handleCODPayment(context);
}

async function makeCardPayment(context, features) {
  const loggedIn =
    (features.saveAddress &&
      (!features.skipSaveOTP || !features.skipAccessOTP)) ||
    (features.addresses?.length && !features.skipAccessOTP);

  await selectPaymentMethod(context, 'card');
  if (!loggedIn && !features.internationalPhoneNumber) {
    await handleCustomerCardStatusRequest(context);
    await handleTypeOTP(context);
    await proceedOneCC(context);
    await respondSavedCards(context);
  }
  const isSavedCardsView = await context.page.$('.saved-inner');
  if (isSavedCardsView) {
    await selectSavedCardAndTypeCvv(context);
  } else {
    await enterCardDetails(context);
  }
  await submit(context);
  await handleCardValidation(context);
  await handleMockSuccessDialog(context);
}

async function makeUpiPayment(context) {
  await selectPaymentMethod(context, 'upi');
  await selectUPIMethod(context, 'new');
  await enterUPIAccount(context, 'sarashgupta1909@okaxios');
  await submit(context);
  await handleUPIAccountValidation(context);
  await handleSaveVpaRequest(context);
  await respondToUPIPaymentStatus(context);
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
  shippingOptions = {},
}) {
  const isNewYorkZipcode = zipcode === '10001';
  const resp = {
    addresses: [
      {
        zipcode,
        country: isNewYorkZipcode ? 'us' : 'in',
        city: isNewYorkZipcode ? 'New York' : 'Bengaluru',
        state: isNewYorkZipcode ? 'New York' : 'KARNATAKA',
        state_code: isNewYorkZipcode ? 'NY' : 'KA',
        cod: isCODEligible,
        cod_fee: codFee,
        shipping_fee: shippingFee,
        serviceable,
      },
    ],
  };

  if (Object.keys(shippingOptions).length) {
    resp.addresses[0].shipping_methods = shippingOptions[zipcode];
  }

  return resp;
}
async function handleShippingInfo(context, options = {}) {
  let req = context.getRequest(`/v1/merchant/shipping_info`);
  const resp = getShippingInfoResponse(options);
  const {
    shipping_fee,
    cod_fee,
    shipping_methods = [],
    serviceable,
  } = resp.addresses[0];
  const state = {
    shippingFee: shipping_fee,
    codFee: cod_fee,
  };
  if (serviceable) {
    state.shippingFee = shipping_fee;
    if (cod_fee) {
      state.codFee = cod_fee;
    }
    if (shipping_methods.length === 1) {
      state.shippingFee = shipping_methods[0].shipping_fee;
      state.codFee = shipping_methods[0].cod_fee;
    } else if (shipping_methods.length > 1) {
      state.shippingFee = 0;
      state.codFee = 0;
    }
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

async function assertShippingOptionsListActions(
  context,
  isOverlay,
  { shippingOptions = [], zipcode = '560001', serviceable }
) {
  if (!serviceable) {
    return;
  }

  await assertVisible('.shipping-list');
  const zipcodeOptions = shippingOptions[zipcode];
  expect(zipcodeOptions.length).toBeGreaterThan(1);

  setState(context, {
    shippingFee: zipcodeOptions[0].shipping_fee,
    codFee: zipcodeOptions[0].cod_fee,
  });

  if (isOverlay) {
    const proceedCta = await context.page.waitForSelector(
      '.shipping-cta-container .btn'
    );
    await proceedCta.evaluate((cta) => cta.click());
  }
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
  assertShippingOptionsListActions,
};
