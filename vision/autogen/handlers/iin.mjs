export function* iin({ request, response }) {
  yield response.jsonp({
    id: 'valid_card',
    data: {
      flows: { otp: true, recurring: false, iframe: false, emi: true },
      type: 'debit',
      issuer: 'HDFC',
      network: 'Visa',
      cobranding_partner: null,
      country: 'IN',
      http_status_code: 200,
    },
  });
}
