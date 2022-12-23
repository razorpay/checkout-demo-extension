import { getAjax } from '../../../mock-api/mocks/create';
import type { handlerType } from '../../core/types';

function getAjaxResponse(id: string, reqBody) {
  switch (id) {
    default:
      return getAjax(reqBody);
  }
}

export const createPaymentAjax: handlerType = function ({ name, request }) {
  let response = getAjaxResponse(name, request.postDataJSON());
  if (!response) {
    console.info(`No preference response found for context:${name}`);
    return {
      response: {},
    };
  }
  return {
    response,
  };
};

// export function createPaymentAjax(
//   route: Route,
//   request: Request,
//   context: any
// ) {
//   if (request.postDataJSON()?.method === 'upi') {
//     return {
//       response: {
//         type: 'async',
//         version: 1,
//         payment_id: 'pay_DaaBCIH1rZXZg5',
//         gateway:
//           'eyJpdiI6IlFOYUo1WEY1WWJmY1FHWURKdmpLeUE9PSIsInZhbHVlIjoiQlhXRTFNcXZKblhxSzJRYTBWK1pMc2VLM0owWUpLRk9JWTZXT04rZlJYRT0iLCJtYWMiOiIxZjk5Yjc5ZmRlZDFlNThmNWQ5ZTc3ZDdiMTMzYzU0ZmRiOTIxY2NlM2IxYjZlNjk5NDEzMGUzMzEzOTA1ZGEwIn0',
//         request: {
//           url: 'https://api.razorpay.com/v1/payments/pay_DaaBCIH1rZXZg5/status?key_id=rzp_test_1DP5mmOlF5G5ag',
//           method: 'GET',
//         },
//       },
//     };
//   }
//   return {
//     response: {
//       razorpay_order_id: 'order_KowyGb3GDaiYp3',
//       razorpay_payment_id: 'pay_Kox82fDvtAUbDd',
//       razorpay_signature:
//         '8a136b64078c5b685f23a352efc03d8177df86b8672b4bce488181766e0db301',
//     },
//   };
// }

// export function validateAccount(route: Route, request: Request, context: any) {
//   const vpa = new URLSearchParams(request.postData() || '').get('value');
//   return { response: { vpa, customer: null, success: true } };
// }

// export function getPaymentStatus(route: Route, request: Request, context: any) {
//   const cbName = new URLSearchParams(request.url()).get('callback');

//   return {
//     response: `/**/${cbName}(${JSON.stringify({
//       razorpay_payment_id: 'pay_KBkMjACVVy1CD1',
//       http_status_code: 200,
//     })});`,
//     content_type: 'text/javascript; charset=UTF-8',
//   };
// }
