const { delay } = require('../../util');

const giftCardList = [
  { giftCardNumber: '1111', amount: 1000 },
  { giftCardNumber: '2222', amount: 2000 },
];

const couponSucResp = {
  promotions: [
    {
      reference_id: 'WELCOME10',
      type: 'percentage',
      code: 'WELCOME10',
      value: 100 * 100,
      value_type: 'number',
      description:
        'Apply code WELCOME10 & get 10% off on your first Rowdy purchase',
    },
  ],
};

async function handleApplyCouponReq(context, restrictCoupon) {
  if (restrictCoupon) {
    await context.getRequest('/v1/merchant/coupon/apply');
    const req = await context.expectRequest();
    expect(req.method).toBe('POST');
    expect(req.url).toContain('coupon/apply');
    await context.respondJSON(couponSucResp);
    await delay(200);
  }
}

function getDataAttrSelector(context, selectorValue) {
  return context.page.waitForSelector(`[data-test-id=${selectorValue}]`);
}

function getApplyGCRes(giftCardInfo) {
  const { giftCardNumber, amount } = giftCardInfo;
  const resp = {
    gift_card_promotion: {
      gift_card_number: giftCardNumber,
      balance: amount,
      allowedPartialRedemption: 1,
    },
  };

  return resp;
}

async function handleApplyGCReq(context, giftCardInfo) {
  await context.getRequest('/giftcard/apply');
  const req = await context.expectRequest();
  expect(req.method).toBe('POST');
  expect(req.url).toContain('giftcard/apply');
  await context.respondJSON(getApplyGCRes(giftCardInfo));
  await delay(200);
}

async function handleRemoveGCReq(context) {
  await context.getRequest('/giftcard/remove');
  const req = await context.expectRequest();
  expect(req.method).toBe('POST');
  expect(req.url).toContain('giftcard/remove');
  await context.respondJSON([]);
  await delay(200);
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

async function handleApplyGC(context, giftCardInfo) {
  const { giftCardNumber } = giftCardInfo;
  const screenEle = await context.page.waitForSelector('.screen-comp');
  await scrollToEnd(context, screenEle);
  await delay(1000);
  const giftCardBanner = await getDataAttrSelector(context, 'gift-card-sec');
  await giftCardBanner.click();
  await context.page.type('#giftCardNumber', giftCardNumber);
  const applyBtn = await getDataAttrSelector(context, 'modal-cta');
  await applyBtn.click();
  await handleApplyGCReq(context, giftCardInfo);
  await delay(4000);
}

async function handleApplySingleGC(context) {
  await handleApplyGC(context, { giftCardNumber: '1111', amount: 1000 });
}

async function handleApplyMultipleGC(context) {
  for (const giftCardItem of giftCardList) {
    await handleApplyGC(context, giftCardItem);
  }
}

async function handleRemoveGC(context, giftCardNumber) {
  const selector = giftCardNumber ? `rmv-item-${giftCardNumber}` : 'rmv-btn';
  const removeBtn = await getDataAttrSelector(context, selector);
  await removeBtn.click();
  await handleRemoveGCReq(context);
  await delay(4000);
}

async function handleRemoveSingleGC(context) {
  await handleRemoveGC(context);
}

async function handleRmvMultipleGC(context) {
  for (const { giftCardNumber } of giftCardList) {
    await handleRemoveGC(context, giftCardNumber);
  }
}

async function checkCODDisabled(context) {
  await delay(1000);
  const errContainer = await context.page.waitForSelector('.error-container');
  const errText = await context.page.evaluate(
    (errContainer) => errContainer.querySelector('.error-label').textContent,
    errContainer
  );
  expect(errText).toBe('Remove gift card to pay with COD');
}

async function checkGCDisabledOnCOD(context, features) {
  const { restrictGC } = features;
  if (restrictGC) {
    const giftCardBanner = await context.page.waitForSelector('.gift-card-sec');
    const errText = await context.page.evaluate(
      (giftCardBanner) =>
        giftCardBanner.querySelector('.disble-subtitle').textContent,
      giftCardBanner
    );
    expect(errText).toBe('Change payment method to use gift card');
  }
}

async function checkOfferDisabled(context, restrictOffer) {
  if (restrictOffer) {
    await context.page.waitForSelector('.disable-offer');
  }
}

async function checkOfferEnabled(context, restrictOffer) {
  if (restrictOffer) {
    const selectOffer = await context.page.waitForSelector('.offer-action');
    await selectOffer.evaluate((b) => b.click());
    await context.page.waitForSelector('.offers-list');
    const closeOfferBtn = await context.page.waitForSelector(
      '.close-offerlist'
    );
    await closeOfferBtn.evaluate((b) => b.click());
  }
}

async function handleGiftCard(context, features) {
  await delay(400);
  const { singleGC, multipleGC, restrictCOD, restrictCoupon, restrictOffer } =
    features;

  if (singleGC) {
    await handleApplySingleGC(context);
    await checkOfferDisabled(context, restrictOffer);
    await handleRemoveSingleGC(context);
    await checkOfferEnabled(context, restrictOffer);
    await handleApplyCouponReq(context, restrictCoupon);
    await handleApplySingleGC(context);
  } else if (multipleGC) {
    await handleApplyMultipleGC(context);
    await handleRmvMultipleGC(context);
    await handleApplyCouponReq(context, restrictCoupon);
  }
  if (restrictCOD) {
    await checkCODDisabled(context);
  }
}

module.exports = {
  handleGiftCard,
  checkGCDisabledOnCOD,
};
