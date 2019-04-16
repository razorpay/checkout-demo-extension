import MethodsListView from 'templates/views/ui/methods/MethodsList.svelte';
import OtherMethodsView from 'templates/views/ui/methods/OtherMethods.svelte';
import { doesAppExist } from 'common/upi';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import { isMobile } from 'common/useragent';
import { AVAILABLE_METHODS } from 'common/constants';

/**
 * Get the available methods.
 *
 * @param {Object} methods
 *
 * @return {Array}
 */
const getAvailableMethods = methods => {
  let AVAIL_METHODS = _Arr.filter(AVAILABLE_METHODS, method =>
    _.isArray(methods[method])
      ? Boolean(methods[method].length)
      : methods[method]
  );

  /**
   * Cardless EMI and EMI are the same payment option.
   * When we click EMI, it should take to Cardless EMI if
   * cardless_emi is an available method.
   */
  if (
    _Arr.contains(AVAIL_METHODS, 'cardless_emi') &&
    _Arr.contains(AVAIL_METHODS, 'emi')
  ) {
    AVAIL_METHODS = _Arr.remove(AVAIL_METHODS, 'emi');
  }

  return AVAIL_METHODS;
};

export default class MethodsList {
  constructor({ target, data }) {
    const session = data.session;
    data.AVAILABLE_METHODS = getAvailableMethods(data.session.methods);

    this.view = new MethodsListView({
      target: _Doc.querySelector(target),
      data,
    });

    this.otherMethodsView = new OtherMethodsView({
      target: _Doc.querySelector('#other-methods'),
      data,
    });

    /* This is to set default screen in the view */
    this.view.set({
      showMessage: session.p13n,
    });

    this.animateNext = data.animate;

    this.data = data;
    this.addListeners();
    this.hasLongClass =
      _Doc.querySelector('#container') |> _El.hasClass('long');
  }

  getSelectedInstrument() {
    return this.selectedInstrument;
  }

  hideOtherMethods() {
    this.view.fire('hideMethods');
  }

  addListeners() {
    this.view.on('select', e => {
      _Doc.querySelector('#body') |> _El.addClass('sub');
      this.selectedInstrument = e;
    });

    this.view.on('showMethods', e => {
      this.otherMethodsView.set({
        visible: true,
      });

      Analytics.track('p13n:methods:show', {
        type: AnalyticsTypes.BEHAV,
      });

      _Doc.querySelector('#body') |> _El.removeClass('sub');
    });

    this.otherMethodsView.on('hideMethods', e => {
      this.otherMethodsView.set({
        visible: false,
      });

      Analytics.track('p13n:methods:hide', {
        type: AnalyticsTypes.BEHAV,
      });

      if (this.view.get().selected) {
        _Doc.querySelector('#body') |> _El.addClass('sub');
      }
    });

    const onMethodSelected = e => {
      let { method } = e.data;

      this.data.session.switchTab(method);
    };

    this.view.on('methodSelected', onMethodSelected);
    this.otherMethodsView.on('methodSelected', onMethodSelected);
  }

  destroy() {
    this.view.destroy();
  }

  set(data) {
    let session = this.data.session;
    if (!data.instruments && data.customer) {
      /* Just setting customer here (login/logout), rest does not change */
      return this.view.set(data);
    }

    data = _Obj.clone(data);
    let noOfInstruments = 2;
    if (isMobile) {
      noOfInstruments = 3;
    }

    /* Only allow for available methods */
    data.instruments = _Arr.filter(data.instruments, data => {
      let { method } = data;

      if (data['_[upiqr]']) {
        method = 'qr';
      }

      return session.methods[method];
    });

    /* Filter out any app that's in user's list but not currently installed */
    data.instruments = _Arr.filter(data.instruments, instrument => {
      if (instrument.method === 'upi' && instrument['_[flow]'] === 'intent') {
        if (instrument['_[upiqr]'] === '1' && !isMobile) {
          return true;
        }

        if (doesAppExist(instrument.upi_app, session.upi_intents_data)) {
          return true;
        }
        return false;
      }

      return true;
    });

    data.instruments = _Arr.slice(data.instruments, 0, noOfInstruments);
    data.selected = null;
    this.selectedInstrument = null;

    var delay = 1500;

    if (this.animateNext === false) {
      delay = 0;
      data.animate = false;
      this.animateNext = true;
    }

    this.view.set(data);
    this.otherMethodsView.set(data);
  }
}
