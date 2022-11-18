import { JsonpResponse } from '#vision/autogen/utils/index.mjs';

function* handleStatus({ request }) {
  yield JsonpResponse(request, {
    razorpay_payment_id: 'pay_KBkMjACVVy1CD1',
    http_status_code: 200,
  });
}

export default handleStatus;
