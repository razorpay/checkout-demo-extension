import { JsonpResponse } from '#vision/autogen/utils/index.mjs';

function* handleCardIIN({ request }) {
  yield JsonpResponse(request, {
    flows: { otp: true, recurring: false, iframe: false, emi: true },
    type: 'debit',
    issuer: 'HDFC',
    network: 'Visa',
    cobranding_partner: null,
    country: 'IN',
    http_status_code: 200,
  });
}

export default handleCardIIN;
