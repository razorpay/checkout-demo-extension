const mockAPI = require('blackbox/tests/custom/mockApi.js');
const makeOptionsAndPreferences = require('./options/index.js');
const { getTestData } = require('../actions');
const { openCheckoutWithNewHomeScreen } = require('../tests/homescreen/open');
const {
  // Generic
  handleFeeBearer,
  submit,
  expectRedirectWithCallback,

  // Offers
  selectCardlessEMIOption,
  handleCardlessEMIValidation,
  typeOTPandSubmit,
  handleOtpVerificationForCardlessEMI,
  selectZestMoneyEMIPlan,
  selectCardlessEMIPlan,
  handleCardlessEMIPaymentCreation,
  handleCardValidationForNativeOTP,
  verifyOTP,
  resendOTP,

  // Partial Payment
  verifyPartialAmount,
} = require('../actions/common');

const {
  // Generic
  proceed,

  // Homescreen
  assertBasicDetailsScreen,
  fillUserDetails,
  assertUserDetails,
  assertPaymentMethods,
  selectPaymentMethod,
  assertEditUserDetailsAndBack,

  // Partial Payments
  handlePartialPayment,
} = require('../tests/homescreen/actions');

module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'cardless-emi',
    testFeatures
  );

  const {
    partialPayment,
    feeBearer,
    callbackUrl,
    optionalContact,
    optionalEmail,
    provider = 'zestmoney',
  } = features;

  if (provider === 'bajaj') {
    // Because, OTP for Bajaj is asked on Checkout,
    // Which is called Native OTP internally,
    // And Native OTP only works on live mode.
    preferences.mode = 'live';
  }

  describe.each(
    getTestData(title, {
      options,
      preferences,
    })
  )(`Cardless EMI - ${provider} tests`, ({ preferences, title, options }) => {
    test(title, async () => {
      preferences.methods.cardless_emi = {
        earlysalary: true,
        zestmoney: true,
        flexmoney: true,
        bajaj: true,
        walnut369: true,
      };
      // Why do the following and not include Bajaj in emi_options.json file?
      // When EMI on Cards is available,
      // we show "EMI" on homescreen, clicking on which takes us to Cards screen
      // However, if EMI on Bajaj is available,
      // we show "EMI" on homescreen, clicking on it takes us to Cardless EMI screen
      // where you'd have a list like
      // 1. EMI on Debit/Credit cards
      // 2. Zest Money
      // 3. Bajaj Finserv
      // This will mess up tests for EMI, because the selector in selectPaymentMethod()
      // will now be "cardless_emi" instead of "emi"
      // God help Razorpay stop adding custom flows and make things complicated.
      preferences.methods.emi_options.BAJAJ = [
        {
          duration: 3,
          interest: 0,
          subvention: 'merchant',
          min_amount: 449900,
          merchant_payback: '0.00',
        },
        {
          duration: 6,
          interest: 7,
          subvention: 'customer',
          min_amount: 499900,
          merchant_payback: '0.00',
        },
        {
          duration: 9,
          interest: 10,
          subvention: 'customer',
          min_amount: 1349900,
          merchant_payback: '0.00',
        },
      ];

      // ZestMoney is disabled on feeBearer merchants
      if (feeBearer) {
        return;
      }
      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });

      const missingUserDetails = optionalContact && optionalEmail;

      const isHomeScreenSkipped = missingUserDetails && !partialPayment; // and not TPV

      if (!isHomeScreenSkipped) {
        await assertBasicDetailsScreen(context);
      }

      if (!missingUserDetails) {
        await fillUserDetails(context, '8888888881');
      }

      if (partialPayment) {
        await handlePartialPayment(context, '4500');
      } else if (!isHomeScreenSkipped) {
        await proceed(context);
      }

      if (!missingUserDetails) {
        await assertUserDetails(context);
        await assertEditUserDetailsAndBack(context);
      }

      await assertPaymentMethods(context);

      await selectPaymentMethod(context, 'cardless_emi');

      if (partialPayment) {
        await verifyPartialAmount(context, '₹ 4,500');
      }
      await selectCardlessEMIOption(context, provider);
      if (feeBearer) {
        await handleFeeBearer(context);
      }
      if (provider === 'zestmoney') {
        if (!context.state.contact) {
          // await context.popup();
          return;
        }
        await handleCardlessEMIValidation(context);
        await typeOTPandSubmit(context);
        await handleOtpVerificationForCardlessEMI(context);
        await selectCardlessEMIPlan(context, 1);
        await submit(context);
      } else if (provider === 'bajaj') {
        await selectCardlessEMIPlan(context, 1, partialPayment ? 1 : 2);
        await submit(context);
        // TODO:
        //  Use enterCardDetails function,
        //  after BAJAJ code is moved away from session.js
        await context.page.type(
          'input[name="card[number]"]',
          '2030400200339945'
        );
        await context.page.type('input[name="card[name]"]', 'Bajaj Customer');
        await submit(context);
        await handleCardValidationForNativeOTP(context, {
          coproto: 'otp',
          expectCallbackUrl: callbackUrl,
        });
        await typeOTPandSubmit(context);
        await verifyOTP(context, 'fail');
        await resendOTP(context);
        await typeOTPandSubmit(context);
        await verifyOTP(context, 'pass');
      } else if (provider === 'walnut369') {
        // expect request
        if (!optionalContact) {
          await context.expectRequest();
          await context.respondJSON(mockAPI.ajaxResponse('cardless_emi'));
        }
        // verifying iframe created ,modal hidden & url open is correct
        await page.waitForFunction(() => {
          const iframe = document.getElementById('iframeFlow');
          const modal = document.getElementById('modal');
          const isModalHidden = modal ? modal.style.display === 'none' : false;
          return iframe && isModalHidden;
        });
        const frame = await page
          .frames()
          .find((fr) => fr.name() === 'iframeFlow');
        // mock success
        await frame.evaluate(() => {
          try {
            (window.opener || window.parent).postMessage(
              JSON.stringify({ razorpay_payment_id: 'pay_123465' }),
              '*'
            );
          } catch (e) {}
        });

        // wait for response
        await new Promise(function (resolve) {
          setTimeout(resolve, 1000);
        });
        return;
      }

      if (feeBearer) {
        await handleFeeBearer(context);
      }

      if (provider !== 'bajaj') {
        if (callbackUrl) {
          await expectRedirectWithCallback(context, { method: 'cardless_emi' });
        } else {
          await handleCardlessEMIPaymentCreation(context);
        }
      }
    });
  });
};
