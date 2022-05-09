import isDetailsPrefilled from 'one_click_checkout/common/middlewares/isDetailsPrefilled';
import hasSavedAddresses from 'one_click_checkout/common/middlewares/hasSavedAddress';

import { views } from 'one_click_checkout/routing/constants';

const config = {
  [views.SAVED_ADDRESSES]: [
    isDetailsPrefilled,
    hasSavedAddresses(views.ADD_ADDRESS, true),
  ],
  [views.SAVED_BILLING_ADDRESS]: [
    hasSavedAddresses(views.ADD_BILLING_ADDRESS, false),
  ],
};

export function runMiddlewares(route, history, navigator) {
  if (!route) {
    return;
  }
  const middlewares = config[route.name] ? [...config[route.name]] : [];

  let nextView;

  nextView = middlewares.reduce((_, middleware) => {
    const next = middleware(route, history, navigator);
    if (next) {
      middlewares.splice(1);
    }
    return next;
  }, route.name);
  return {
    path: nextView?.path ? nextView.path : nextView || route.name,
    props: nextView?.props,
  };
}
