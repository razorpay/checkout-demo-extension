import { Request, Route } from 'playwright-chromium';

export function getShippingInfo(route: Route, request: Request, context: any) {
  const zipcode = request.postDataJSON()['addresses[0][zipcode]'];

  return {
    response: {
      addresses: [
        {
          city: 'Bengaluru',
          state: 'Karnataka',
          state_code: 'KA',
          country: 'in',
          zipcode,
          shipping_fee: 4900,
          serviceable: context.serviceable.includes(zipcode),
          cod: true,
          cod_fee: 4900,
        },
      ],
    },
  };
}
