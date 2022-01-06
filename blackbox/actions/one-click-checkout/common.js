const { delay } = require('../../util');

function getVerifyOTPResponse(inValidOTP) {
  const successResp = {
    success: 1,
    session_id: 'IU7w1z3PBZnA6O',
    addresses: [
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
    ],
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
  const req = await context.expectRequest();
  expect(req.method).toBe('GET');
  expect(req.url).toContain('customers/status');
  await context.respondJSON({
    saved: saved_address,
    saved_address,
  });
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
  expect(req.method).toBe('POST');
  expect(req.url).toContain('otp/create');
  await context.respondJSON({ success: false });
}

async function handleVerifyOTPReq(context, inValidOTP = false) {
  const req = await context.expectRequest();
  expect(req.method).toBe('POST');
  expect(req.url).toContain('otp/verify');
  await context.respondJSON(getVerifyOTPResponse(inValidOTP));
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
      const getElemTextByIndex = (element, index, subIndex = 1) => {
        const itemElement =
          element.getElementsByClassName('summary-row')[index];
        const item =
          itemElement.getElementsByTagName('div')[subIndex].innerText;
        return item;
      };
      const price = getElemTextByIndex(element, 0);
      const shippingAmount = getElemTextByIndex(element, 1);
      if (isValidCoupon && codFee) {
        const codAmount = getElemTextByIndex(element, 2);
        const couponText = getElemTextByIndex(element, 3, 0);
        const discountPrice = getElemTextByIndex(element, 3);
        const total = getElemTextByIndex(element, 4);
        return {
          price,
          codAmount,
          total,
          shippingAmount,
          couponText,
          discountPrice,
        };
      } else if (isValidCoupon) {
        const couponText = getElemTextByIndex(element, 2, 0);
        const discountPrice = getElemTextByIndex(element, 2);
        const total = getElemTextByIndex(element, 3);
        return { price, discountPrice, total, couponText, shippingAmount };
      } else if (codFee) {
        const codAmount = getElemTextByIndex(element, 2);
        const total = getElemTextByIndex(element, 3);
        return { price, codAmount, total, shippingAmount };
      } else {
        const total = getElemTextByIndex(element, 2);
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
  if (couponValid && isSelectCOD) {
    const {
      price,
      discountPrice,
      total,
      couponText,
      shippingAmount,
      codAmount,
    } = await getSummaryInfo(context, couponValid, codFee);
    if (!shippingFee) {
      expect('FREE').toEqual(shippingAmount);
    }
    expect(price).toEqual(`₹ ${amount / 100}`);
    expect(codAmount).toEqual(`₹ ${codFee / 100}`);
    expect(`Coupon (${couponCode})`).toEqual(couponText);
    expect(discountPrice).toEqual(`-₹ ${discountAmount / 100}`);
    const calcTotalAmount = Math.abs(
      amount / 100 + codFee / 100 - discountAmount / 100
    );
    expect(total).toEqual(`₹ ${calcTotalAmount}`);
  } else if (couponValid && !removeCoupon) {
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

async function handleTypeOTP(context, otpValue = '000008') {
  await context.page.waitForSelector('#otp-input');
  for (const [index, value] of otpValue.split('').entries()) {
    await context.page.type(`input[id="otp[${index}]"]`, value);
  }
}

async function handleSkipOTP(context) {
  await context.page.waitForSelector('#otp-sec');
  await context.page.click('#otp-sec');
}

async function checkInvalidOTP(context) {
  await context.page.waitForSelector('.error-message');
  expect(
    await context.page.$eval('.error-message', (el) => el.innerText)
  ).toEqual('Entered OTP was incorrect. Re-enter to proceed.');
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
};
