const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
const {
  resetContactDetails,
  checkPhoneValidation,
} = require('../../actions/one-click-checkout/contact.js');
const {
  handleAvailableCouponReq,
} = require('../../actions/one-click-checkout/coupons');
const {
  handleCustomerStatusReq,
  handleCreateOTPReq,
  handleTypeOTP,
  handleVerifyOTPReq,
  handleSkipOTP,
  checkInvalidOTP,
  proceedOneCC,
  mockPaymentSteps,
  handleShippingInfo,
  login,
  goBack,
  checkSkipOTPHidden,
} = require('../../actions/one-click-checkout/common');
const {
  handleAddAddress,
  fillUserAddress,
  handleCustomerAddressReq,
  assertUnserviceableAddress,
  unCheckBillAddress,
  handleManageAddress,
  handleEditAddress,
  handleEditAddressReq,
  handleBillingAddress,
  checkStateFieldDisabled,
  checkInvalidAddressForm,
  selectUnselectedAddress,
} = require('../../actions/one-click-checkout/address');
const {
  assertAddressTab,
} = require('../../actions/one-click-checkout/navigation');
const {
  fillUserDetails,
} = require('../../tests/homescreen/userDetailsActions');
const { delay } = require('../../util');

const INDIAN_CONTACT_ERROR_LABEL = 'Enter a 10-digit number only.';
const CONTACT_ERROR_LABEL = 'Enter a valid mobile number.';
/**
 * @param {*} testFeatures
 * @param {*} testFeatures.loggedIn to generate a pre-loggedIn flow
 * @param {*} testFeatures.saveAddress to save a new address or not
 * @param {*} testFeatures.addShippingAddress to open add shippingAddress
 * @param {*} testFeatures.addBillingAddress to open add billingAddress
 * @param {*} testFeatures.editShippingAddress to open edit shippingAddress
 * @param {*} testFeatures.editBillingAddress to open edit billingAddress
 * @param {*} testFeatures.serviceable is pincode serviceable
 * @param {*} testFeatures.skipAccessOTP skip OTP to access savedAddresses
 * @param {*} testFeatures.skipSaveOTP skip OTP to save new address
 * @param {*} testFeatures.isCODEligible is COD eligible
 * @param {*} testFeatures.inValidOTP is OTP valid
 * @param {*} testFeatures.addLandmark add landmark in new address
 * @param {*} testFeatures.addresses user saved addresses
 * @param {*} testFeatures.mandatoryLogin user has to login after details/summary screen
 *
 */
module.exports = function (testFeatures) {
  const { features, preferences, options, title } = makeOptionsAndPreferences(
    'one-click-checkout',
    testFeatures
  );
  const {
    skip,
    loggedIn,
    saveAddress,
    addShippingAddress,
    addBillingAddress,
    editShippingAddress,
    editBillingAddress,
    serviceable,
    skipAccessOTP,
    skipSaveOTP,
    isCODEligible,
    inValidOTP,
    addLandmark,
    addresses = [],
    invalidAddress,
    mandatoryLogin,
    shippingFee,
    manageAddress,
    selectUnserviceable,
    consentBannerViews,
  } = features;

  describe.each(
    getTestData(title, {
      ...features,
      options,
      preferences,
    })
  )('One Click Checkout Address test', ({ preferences, title, options }) => {
    if (skip) {
      test.skip(title, () => {});
      return;
    }
    test(title, async () => {
      preferences.methods.cod = true;
      preferences.methods.upi = true;

      /**
       * L1 QRv2 has to be disable, for old flow to work
       */
      let qrV2FeatureFlags = {
        disable_homescreen_qr: true,
        disable_upiscreen_qr: true,
      };
      if (preferences.features) {
        preferences.features = { ...preferences.features, ...qrV2FeatureFlags };
      } else {
        preferences.features = qrV2FeatureFlags;
      }

      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });
      await delay(500);
      if (features.showCoupons) {
        await handleAvailableCouponReq(context);
      }
      // loggedIn address flows
      if (loggedIn) {
        if (addresses.length) {
          await handleShippingInfo(context, { serviceable });
        }

        // default address is unserviceable at L0 screen
        if (!serviceable) {
          await assertUnserviceableAddress(context);
          return;
        }

        if (manageAddress) {
          await delay(100);
          await handleManageAddress(context);
          await handleShippingInfo(context, {
            zipcode: '560002',
            serviceable: !selectUnserviceable,
          });
          await delay(100);
          if (selectUnserviceable) {
            // select second unserviceable address
            await selectUnselectedAddress(context, addresses, 1);
            // assert disabled cta
            await assertUnserviceableAddress(context);
            return;
          }
        }

        if (addShippingAddress || editShippingAddress) {
          await handleManageAddress(context);
          await delay(400);
          if (addShippingAddress) {
            await handleAddAddress(
              context,
              {
                saveAddress,
                isCODEligible,
                zipcode: '560002',
                addLandmark,
                shippingFee,
              },
              addresses
            );
            await checkStateFieldDisabled(context);

            if (editBillingAddress || addBillingAddress) {
              await handleBillingAddress(context, addBillingAddress, addresses);
              await checkStateFieldDisabled(context);
            }
          } else {
            // edit shipping address

            await handleEditAddress(context);
            if (editBillingAddress || addBillingAddress) {
              await handleBillingAddress(context, addBillingAddress, addresses);
            }
          }
        } else if (editBillingAddress || addBillingAddress) {
          // unchecking billing address checkbox at L0 screen

          await unCheckBillAddress(context);
          await proceedOneCC(context);
          await handleAddAddress(
            context,
            {
              saveAddress,
              isBillingAddress: true,
            },
            addresses
          );
        }
      } else {
        // logged out / guest user flows

        await checkPhoneValidation(
          context,
          '995239840',
          INDIAN_CONTACT_ERROR_LABEL
        );
        await resetContactDetails(context);
        await checkPhoneValidation(
          context,
          '99523984078',
          INDIAN_CONTACT_ERROR_LABEL
        );
        await resetContactDetails(context);
        await checkPhoneValidation(context, '1000000000', CONTACT_ERROR_LABEL);
        await resetContactDetails(context);

        await fillUserDetails(context);
        await proceedOneCC(context);
        await handleCustomerStatusReq(
          context,
          addresses.length,
          consentBannerViews
        );

        if (addresses.length) {
          // OTP screen if user has addresses
          await handleCreateOTPReq(context);
          await handleTypeOTP(context);
          await delay(200);

          if (skipAccessOTP) {
            await handleSkipOTP(context);
            await fillUserAddress(context, {
              saveAddress,
              isCODEligible,
              serviceable,
            });
            await delay(400);
            await proceedOneCC(context);
          } else {
            if (mandatoryLogin) {
              await checkSkipOTPHidden();
            }
            await proceedOneCC(context);
            await handleVerifyOTPReq(context, inValidOTP, { addresses });
            if (inValidOTP) {
              await checkInvalidOTP(context);
              return;
            }
            await handleShippingInfo(context, options);
          }
        } else {
          if (mandatoryLogin) {
            await handleCreateOTPReq(context);
            await handleTypeOTP(context);
            await delay(200);
            await checkSkipOTPHidden();
            await proceedOneCC(context);
            await handleVerifyOTPReq(context, inValidOTP, {
              addresses,
              mandatoryLogin,
            });
            if (inValidOTP) {
              await checkInvalidOTP(context);
              return;
            }
          }

          if (invalidAddress) {
            await delay(400);
            await proceedOneCC(context);
            await checkInvalidAddressForm(context);
            await assertAddressTab(context);
            return;
          }

          await fillUserAddress(context, {
            saveAddress,
            isCODEligible,
            serviceable,
          });

          // unserviceable address in add address form
          if (!serviceable) {
            await delay(200);
            await assertUnserviceableAddress(context, true);
            return;
          }

          if (addBillingAddress) {
            await unCheckBillAddress(context);
            await proceedOneCC(context);

            await fillUserAddress(context, {
              saveAddress,
              isBillingAddress: true,
            });
          }
          if (
            saveAddress &&
            !mandatoryLogin &&
            (!addresses.length || skipAccessOTP)
          ) {
            await delay(400);
            await proceedOneCC(context);
          }
        }

        // to show OTP screen to save address
        if (
          saveAddress &&
          !mandatoryLogin &&
          (!addresses.length || skipAccessOTP)
        ) {
          await handleCreateOTPReq(context);
          if (skipSaveOTP) {
            await handleSkipOTP(context);
          } else {
            await handleTypeOTP(context);
            await proceedOneCC(context);
            await handleVerifyOTPReq(context);
          }
        }
      }

      await delay(200);
      await proceedOneCC(context);

      if (loggedIn && !addresses.length) {
        await delay(400);
        await fillUserAddress(context, {
          saveAddress,
          isCODEligible,
          serviceable,
          addLandmark,
        });
        await delay(100);
        await proceedOneCC(context);
      }

      if (saveAddress && (!skipSaveOTP || mandatoryLogin)) {
        await handleCustomerAddressReq(context);
      }

      if (editShippingAddress || editBillingAddress) {
        await handleEditAddressReq(context);
      }

      await mockPaymentSteps(context, options, features);
    });
  });
};
