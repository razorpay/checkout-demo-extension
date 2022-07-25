const makeOptionsAndPreferences = require('../options/index.js');
const {
  openCheckoutWithNewHomeScreen,
} = require('../../tests/homescreen/open');
const { getTestData } = require('../../actions');
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
} = require('../../actions/one-click-checkout/common');
const {
  handleAddAddress,
  fillUserAddress,
  handleCustomerAddressReq,
  handleCheckUnserviceable,
  unCheckBillAddress,
  handleManageAddress,
  handleEditAddress,
  handleEditAddressReq,
  handleBillingAddress,
  checkStateFieldDisabled,
  checkInvalidAddressForm,
} = require('../../actions/one-click-checkout/address');
const {
  assertAddressTab,
} = require('../../actions/one-click-checkout/navigation');
const {
  fillUserDetails,
} = require('../../tests/homescreen/userDetailsActions');
const { delay } = require('../../util');

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

      const context = await openCheckoutWithNewHomeScreen({
        page,
        options,
        preferences,
      });
      await delay(500);
      if (options.show_coupons) {
        await handleAvailableCouponReq(context);
      }
      // loggedIn address flows
      if (loggedIn) {
        if (addresses.length) {
          await handleShippingInfo(context, { serviceable });
        }

        // default address is unserviceable at L0 screen
        if (!serviceable) {
          await handleCheckUnserviceable(context);
          return;
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

        await fillUserDetails(context);
        await proceedOneCC(context);
        await handleCustomerStatusReq(context, addresses.length);

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
            await proceedOneCC(context);
            await handleVerifyOTPReq(context, inValidOTP, { addresses });
            if (inValidOTP) {
              await checkInvalidOTP(context);
              return;
            }
            await handleShippingInfo(context, options);
          }
        } else {
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
            await handleCheckUnserviceable(context, true);
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
        }

        // to show OTP screen to save address
        if (saveAddress && (!addresses.length || skipAccessOTP)) {
          await delay(200);
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

      await proceedOneCC(context);

      if (saveAddress && !skipSaveOTP) {
        await handleCustomerAddressReq(context);
      }

      if (editShippingAddress || editBillingAddress) {
        await handleEditAddressReq(context);
      }

      await mockPaymentSteps(context, options, features);
    });
  });
};
