import isDetailsPrefilled from 'one_click_checkout/common/middlewares/isDetailsPrefilled';
import hasSavedAddresses from 'one_click_checkout/common/middlewares/hasSavedAddress';

import { views } from 'one_click_checkout/routing/constants';

const config = {
  [views.SAVED_ADDRESSES]: [
    isDetailsPrefilled,
    hasSavedAddresses(views.ADD_ADDRESS, true, 'access_saved_address'),
  ],
  [views.SAVED_BILLING_ADDRESS]: [
    hasSavedAddresses(views.ADD_BILLING_ADDRESS, false),
  ],
};

export function runMiddlewares(view, history) {
  const middlewares = config[view] ? [...config[view]] : [];

  let nextView;

  nextView = middlewares.reduce((_, middleware) => {
    const next = middleware(view, history);
    if (next) {
      middlewares.splice(1);
    }
    return next;
  }, view);

  return nextView || view;
}
