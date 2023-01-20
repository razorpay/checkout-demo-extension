// TODO uncomment based on addition of new tests
import { checkCodEligibility } from '../mock/api/cod';
import { getMerchantCoupons } from '../mock/api/coupons';
import { getCustomerStatus } from '../mock/api/customer';
import { patchCustomerData, resetOrder } from '../mock/api/order';
import {
  createOtp,
  otpSubmitHandler,
  truecallerVerifyCustomer,
  verifyOtp,
  verifyOtpOneCC,
} from '../mock/api/otp';
// import {
//   getPaymentStatus,
//   validateAccount,
// } from '../mock/api/payments';
// import { getShippingInfo } from '../mock/api/shipping_info';
import {
  checkoutOrderHandler,
  checkoutOrderStatusHandler,
  deleteCheckoutOrderHandler,
} from '../mock/api/checkoutOrder';
import { getRewards } from '../mock/api/misc';
import { createPaymentAjax } from '../mock/api/payments';
import P13nHandler from '../mock/api/personalisation';
import preferences from '../mock/api/preferences';
import feeBearerHandler from '../mock/api/fee';
import { cardIINHandler, paymentFlowsHandler } from '../mock/api/card';

/**
 * Route mapping corresponds to key which is used for api override also
 * [id]: {
 *  path: <partial Path>,
 *  method: <API method>,
 *  handler: <API Handler>
 * }
 */
export const API_ROUTES_MAPPING = {
  preferences: {
    path: '/preferences',
    method: 'get',
    handler: preferences,
  },
  rewards: {
    path: '/checkout/rewards',
    method: 'get',
    handler: getRewards,
  },
  personalisation: {
    path: '/personalisation',
    method: 'get',
    handler: P13nHandler,
  },
  checkoutOrder: {
    path: '/checkout/order',
    method: 'post',
    handler: checkoutOrderHandler,
  },
  deleteCheckoutOrder: {
    path: '/checkout/order/:id',
    method: 'delete',
    handler: deleteCheckoutOrderHandler,
  },
  checkoutOrderStatus: {
    path: '/checkout/qr_code/:qrId/payment/status',
    method: 'get',
    handler: checkoutOrderStatusHandler,
  },
  feeBearer: {
    path: '/payments/calculate/fees',
    method: 'post',
    handler: feeBearerHandler,
  },
  customer_status: {
    path: '/customers/status/:contact',
    method: 'get',
    handler: getCustomerStatus,
  },
  otp_create: {
    path: '/otp/create',
    handler: createOtp,
    method: 'post',
  },
  otp_verify: {
    path: '/otp/verify',
    handler: verifyOtp,
    method: 'post',
  },
  create_ajax: {
    path: '/payments/create/ajax',
    handler: createPaymentAjax,
    method: 'post',
  },
  otpSubmit: {
    path: '/checkout/:type/v1/payments/:paymentId/otp_submit/:token',
    handler: otpSubmitHandler,
    method: 'post',
  },
  //   validate_account: {
  //     path: '/payments/validate/account',
  //     handler: validateAccount,
  //     method: 'post',
  //   },
  //   payment_status: {
  //     path: '/payments/:payment_id/status',
  //     method: 'get',
  //     handler: getPaymentStatus,
  //   },
  //   '1cc_truecaller': {
  //     path: '/1cc/customers/truecaller/verify',
  //     handler: truecallerVerifyCustomer,
  //     method: 'post',
  //   },
  //   '1cc_order_reset': {
  //     path: '/orders/1cc/:order_id/reset',
  //     method: 'post',
  //     handler: resetOrder,
  //   },
  //   '1cc_otp_verify': {
  //     path: '/1cc/otp/verify',
  //     method: 'post',
  //     handler: verifyOtpOneCC,
  //   },
  //   '1cc_merchant_coupon': {
  //     path: '/merchant/coupons',
  //     method: 'get',
  //     handler: getMerchantCoupons,
  //   },
  //   '1cc_customer_data': {
  //     path: '/orders/1cc/:order_id/customer',
  //     method: 'patch',
  //     handler: patchCustomerData,
  //   },
  //   '1cc_shipping_info': {
  //     path: '/merchant/shipping_info',
  //     method: 'post',
  //     handler: getShippingInfo,
  //   },
  //   '1cc_cod_check': {
  //     path: '/1cc/check_cod_eligibility',
  //     method: 'post',
  //     handler: checkCodEligibility,
  //   },
  paymentFlows: {
    path: '/payment/flows',
    handler: paymentFlowsHandler,
    method: 'get',
  },
  cardIIN: {
    path: '/payment/iin',
    handler: cardIINHandler,
    method: 'get',
  },
} as const;

export function attachHandlers(router) {
  // common routes
  Object.entries(API_ROUTES_MAPPING).forEach(([key, value]) => {
    router[value.method || 'get'](`/v1${value.path}`, value.handler, {
      id: key,
    });
  });
}
