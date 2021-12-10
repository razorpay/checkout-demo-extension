import { activeRoute, history } from 'one_click_checkout/routing/store';
import { get } from 'svelte/store';
import { views } from 'one_click_checkout/routing/constants';

export const screensHistory = {
  isInitialized: false,
  config: null,
  previousRoute: function () {
    const index = get(history).length - 1;
    return index >= 0 ? get(history)[index].name : null;
  },
  pop: function (currentView) {
    const newHistory = get(history);
    if (currentView !== views.OTP) {
      newHistory.pop();
    }
    const view = newHistory[newHistory.length - 1];
    history.set(newHistory);
    return view;
  },
  push: function (nextView) {
    const newHistory = get(history);

    if (nextView !== views.OTP) {
      newHistory.push(nextView);
    }
    history.set(newHistory);
  },
  replace: function (newView, history) {
    this.pop();
    this.push(newView, history);
  },
  initialize: function (view) {
    const newHistory = [view];
    history.set(newHistory);
    this.isInitialized = true;
  },
  setConfig: function (config) {
    this.config = config;
  },
  popUntil: function (view) {
    while (view !== get(activeRoute).name) {
      this.pop();
    }
  },
};
