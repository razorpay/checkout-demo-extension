import { Request, Route } from 'playwright-chromium';

export function getCustomerStatus(
  route: Route,
  request: Request,
  context: any
) {
  return {
    response: {
      saved: true,
      saved_address: context.addresses?.length ? true : false,
      '1cc_consent_banner_views': 0,
      '1cc_customer_consent': 0,
    },
  };
}
