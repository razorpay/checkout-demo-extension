const { handleCardValidation } = require('./card-actions');

async function verifyEMIPlansWithOffers(context, offerNumber) {
  const lists = await context.page.$$('.emi-plans-list');
  expect(lists.length).toBe(2);
  await context.page.$$eval(
    '.emi-plans-list:nth-child(2) .expandable-card',
    (elems, offerNumber) => {
      if (elems.length != offerNumber) {
        throw `EMI Plan elements with offer (${elems.length}) not equal to expected number (${offerNumber})`;
      }
      if (offerNumber && !elems[0].offsetWidth) {
        throw 'EMI Plan element with offer not visible';
      }
    },
    [offerNumber]
  );
}

async function selectEMIPlanWithOffer(context, offerNumber) {
  await context.page.click(
    `.emi-plans-list:nth-child(2) .expandable-card:nth-child(${offerNumber})`
  );
}

async function verifyEMIPlansWithoutOffers(context, offerNumber) {
  await context.page.$$eval(
    '.emi-plans-list .expandable-card',
    (elems, offerNumber) => {
      if (elems.length != offerNumber) {
        throw `EMI Plan elements without offer (${elems.length}) not equal to expected number (${offerNumber})`;
      }
      if (offerNumber && !elems[0].offsetWidth) {
        throw 'EMI Plan element without offer not visible';
      }
    },
    [offerNumber]
  );
}

async function selectEMIPlanWithoutOffer(context, offerNumber) {
  await context.page.click(
    '.emi-plans-list .expandable-card:nth-child(' + offerNumber + ')'
  );
}

async function selectCardlessEMIOption(context, optionName) {
  await page.$eval(`img[src$="${optionName}.svg"]`, el => el.click());
}

async function handleCardlessEMIValidation(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('create/ajax');
  await context.respondJSON({
    type: 'respawn',
    method: 'cardless_emi',
    request: {
      url:
        'https://api.razorpay.com/v1/otp/verify?method=cardless_emi&provider=zestmoney&payment_id=pay_DnKu1wENm6Bqij&key_id=rzp_test_ILgsfZCZoFIKMb',
      method: 'POST',
      content: {
        contact: '+919620875358',
        email: 'umanghome@gmail.com',
        method: 'cardless_emi',
        provider: 'zestmoney',
        amount: '550000',
        currency: 'INR',
        description: 'Fine tshirt',
        _: {
          shield: {
            fhash: 'd2ff2d8d9f8834d57771e74ab98aa3dc6124592c',
            tz: '330',
          },
          checkout_id: 'DnKtENe080u90u',
          library: 'checkoutjs',
          platform: 'browser',
          referer: 'https://razorpay.com/emidemo/',
        },
        payment_id: 'pay_DnKu1wENm6Bqij',
      },
    },
    image: null,
    theme: '#528FF0',
    merchant: 'Razorpay Software Private Limited',
    gateway:
      'eyJpdiI6IlByY0Z0TmVDQThLa1E3dTlhTU5XMkE9PSIsInZhbHVlIjoiKzRLRDBBd2czNDRPTW1pTEZ3TmErbHFwT0R1akdJaWRDYVU1QVFOaUVNSElRaTlEYnFVXC8zNmtDeWluYm9XbXYiLCJtYWMiOiJjZmQ5MmNhMzhiMTU5NTkzYTM4M2NkYjBlMDg3NzEzMTAzYzU2YzYyNDY1YjMzMWM2NzhjMGIwZjY4Nzc0MWI2In0=',
    key_id: 'rzp_test_ILgsfZCZoFIKMb',
    version: '1',
    payment_create_url:
      'https://api.razorpay.com/v1/payments?key_id=rzp_test_ILgsfZCZoFIKMb',
    resend_url:
      'https://api.razorpay.com/v1/otp/create?key_id=rzp_test_ILgsfZCZoFIKMb',
    payment_id: 'pay_DnKu1wENm6Bqij',
  });
}

async function handleOtpVerificationForCardlessEMI(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('/otp/verify');
  await context.respondJSON({
    success: 1,
    emi_plans: [
      {
        entity: 'emi_plan',
        currency: 'INR',
        duration: 3,
        interest: 1.51,
        amount_per_month: 191639,
      },
      {
        entity: 'emi_plan',
        currency: 'INR',
        duration: 6,
        interest: 1.75,
        amount_per_month: 101292,
      },
      {
        entity: 'emi_plan',
        currency: 'INR',
        duration: 9,
        interest: 1.5,
        amount_per_month: 69362,
      },
      {
        entity: 'emi_plan',
        currency: 'INR',
        duration: 12,
        interest: 1.5,
        amount_per_month: 54087,
      },
    ],
    ott: '75bed1236fc138',
    loan_url:
      'https://app.zestmoney.in/PaymentGateway//RazorPay/document/loanAgreement/442b3d49-e327-402c-a573-076904111d47/customer/920f1035-c9d8-4b6e-ab20-d868c9f1f5ed',
  });
}

async function handleCardlessEMIPaymentCreation(context) {
  const req = await context.expectRequest();
  expect(req.url).toContain('create/ajax');
  await context.respondJSON({ razorpay_payment_id: 'pay_DneDz2O07GKjQy' });
}

async function selectZestMoneyEMIPlan(context, planNumber) {
  return selectCardlessEMIPlan(context, planNumber);
}

async function assertCardlessEMIPlansList(page, expected) {
  const list = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.emi-plans-list .expandable-card'))
  );
  expect(list.length).toBe(expected);
}

async function selectCardlessEMIPlan(context, planNumber, numOfPlansExpected) {
  if (numOfPlansExpected) {
    await assertCardlessEMIPlansList(context.page, numOfPlansExpected);
  }
  await context.page.waitForSelector('.emi-plans-list .expandable-card');
  const emiPlans = await context.page.$x(
    '//div[contains(@class,"emi-plans-list")]/div[contains(@class,"expandable-card")]'
  );
  await emiPlans[planNumber - 1].click();
}

//emi-plans-list expandable-card-list

module.exports = {
  verifyEMIPlansWithOffers,
  selectEMIPlanWithOffer,
  verifyEMIPlansWithoutOffers,
  selectEMIPlanWithoutOffer,
  handleEMIValidation: handleCardValidation,
  selectCardlessEMIOption,
  handleCardlessEMIValidation,
  handleOtpVerificationForCardlessEMI,
  handleCardlessEMIPaymentCreation,
  selectZestMoneyEMIPlan,
  selectCardlessEMIPlan,
};
