import { history, currentView } from 'one_click_checkout/routing/store';
import { get } from 'svelte/store';
import { views } from 'one_click_checkout/routing/constants';
import { runMiddlewares } from 'one_click_checkout/routing/middleware';

export const screensHistory = {
  isInitilized: false,
  config: null,
  previousRoute: function () {
    const index = get(history).length - 1;
    return get(history)[index];
  },
  peek: function () {
    const last = get(history).length - 1;
    return get(history)[last];
  },
  pop: function (changeView = true) {
    const newHistory = get(history);
    if (get(currentView) !== views.OTP) {
      newHistory.pop();
    }
    if (changeView) {
      const view = newHistory[newHistory.length - 1];
      this.temp(newHistory, view);
    }
  },
  push: function (view) {
    const nextView = runMiddlewares(view, this);
    const newHistory = get(history);

    if (nextView !== views.OTP) {
      newHistory.push(nextView);
    }
    this.temp(newHistory, nextView);
  },
  popAll: function () {
    const newHistory = [];
    const view = views.COUPONS;
    this.temp(newHistory, view);
  },
  replace: function (newView) {
    this.pop();
    this.push(newView);
  },
  initialize: function (view) {
    const history = [];
    history.push(view);
    this.temp(history, view);
    this.isInitilized = true;
  },
  // TODO: better name
  temp: function (newHistory, view) {
    history.set(newHistory);
    currentView.set(view);
  },
  setConfig: function (config) {
    this.config = config;
  },
  popUntil: function (view) {
    while (view !== get(currentView)) {
      this.pop();
    }
  },
};
