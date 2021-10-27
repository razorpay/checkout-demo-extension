import { history, currentView } from 'one_click_checkout/home/store';
import { get } from 'svelte/store';
import { views } from 'one_click_checkout/home/constants';

export const screensHistory = {
  pop: function (changeView = true) {
    const newHistory = get(history);
    if (get(currentView) !== views.OTP) {
      newHistory.pop();
    }
    let view = '';
    if (changeView) {
      view = newHistory[newHistory.length - 1];
    }
    this.temp(newHistory, view);
  },
  push: function (view) {
    if (!view) {
      return;
    }
    const newHistory = get(history);
    if (view !== views.OTP) {
      newHistory.push(view);
    }
    this.temp(newHistory, view);
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
  },
  // TODO: better name
  temp: function (newHistory, view) {
    history.set(newHistory);
    if (view) {
      currentView.set(view);
    }
  },
};
