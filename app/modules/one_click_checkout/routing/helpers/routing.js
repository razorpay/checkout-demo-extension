import { get } from 'svelte/store';
import { screensHistory } from 'one_click_checkout/routing/History';
import { runMiddlewares } from 'one_click_checkout/routing/middleware';
import {
  getRoute,
  activeRoute,
  history,
} from 'one_click_checkout/routing/store';
import { views } from 'one_click_checkout/routing/constants';

// eslint-disable-next-line no-restricted-syntax
export const navigator = {
  // eslint-disable-next-line no-restricted-syntax
  get currentActiveRoute() {
    return get(activeRoute);
  },
  navigateTo: function ({
    path,
    initialize = false,
    props,
    overrideMiddlewares = null,
  }) {
    let nextView = runMiddlewares(
      getRoute(path),
      screensHistory,
      this,
      overrideMiddlewares
    ) || {
      path,
    };
    if (nextView.props) {
      props = nextView.props;
    }
    nextView = nextView.path;
    const route = { ...getRoute(nextView) };
    if (Object.keys(route).length === 0) {
      route.name = nextView;
    }
    if (props) {
      route.props = { ...route.props, ...props };
    }
    activeRoute.set(route);
    if (nextView === 'otp') {
      return;
    }
    if (screensHistory.isInitialized && !initialize) {
      screensHistory.push(route);
    } else {
      screensHistory.initialize(route);
    }
  },
  navigateBack: function (path) {
    let nextRoute;
    if (path) {
      screensHistory.popUntil(path);
      nextRoute = getRoute(path);
    } else {
      nextRoute = screensHistory.pop(get(activeRoute).name);
    }
    activeRoute.set(nextRoute);
  },
  replace: function (path) {
    this.navigateBack();
    this.navigateTo({ path });
  },
  isRedirectionFromMethods: function () {
    const currHistory = get(history);
    return currHistory[currHistory.length - 2]?.name === views.METHODS;
  },
};
