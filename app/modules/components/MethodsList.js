import MethodsListView from 'templates/views/ui/methods/MethodsList.svelte';
import OtherMethodsView from 'templates/views/ui/methods/OtherMethods.svelte';
import { doesAppExist } from 'common/upi';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import { isMobile } from 'common/useragent';
import { AVAILABLE_METHODS } from 'common/constants';
import {
  filterInstrumentsForAvailableMethods,
  _createInstrumentForImmediateUse,
} from 'checkoutframe/personalization';

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

  /**
   * We do not want to show QR in the primary list
   * of payment options anymore
   */
  AVAIL_METHODS = _Arr.remove(AVAIL_METHODS, 'qr');

  return AVAIL_METHODS;
};

export default class MethodsList {
  constructor({ target, data }) {
    const session = data.session;
    data.AVAILABLE_METHODS = getAvailableMethods(data.session.methods);

    // We do not want to show PayPal in the list in case of international
    if (data.session.international) {
      data.AVAILABLE_METHODS = _Arr.remove(data.AVAILABLE_METHODS, 'paypal');
    }

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
      let { method, down } = e.data;

      if (down) {
        return;
      }

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

    /**
     * This count is also being sent with the
     * p13n:instruments:list event.
     */
    let noOfInstrumentsToShow = 2;
    if (isMobile()) {
      /**
       * We want to show 3 insturments on mobile devices, since we have more height.
       * But, to show 3 instruments, we need to have at least 590px worth of height.
       * Otherwise the Pay button will overlap the "Other Methods" button.
       *
       * So, we'll get the number of instruments to show based on the current screen height.
       *
       * This can be removed once switched to a list view of payment methods.
       */

      if (global.innerHeight >= 590) {
        noOfInstrumentsToShow = 3;
      } else if (global.innerHeight >= 545) {
        noOfInstrumentsToShow = 2;
      } else {
        noOfInstrumentsToShow = 1;
      }
    }

    /* Only allow for available methods */
    data.instruments = filterInstrumentsForAvailableMethods(
      data.instruments,
      session.methods
    );

    /**
     * For international + paypal,
     * paypal should show up as one
     * of the preferred methods
     * for UI-related reasons,
     * but at the end
     */
    if (session.international && session.methods.paypal) {
      /**
       * If merchant doesn't want p13n,
       * data.instruments should contain only PayPal
       */
      if (session.get().personalization === false) {
        data.instruments = [];
      }

      data.instruments =
        data.instruments
        |> _Arr.insertAt(
          _createInstrumentForImmediateUse({
            method: 'paypal',
          }),
          noOfInstrumentsToShow - 1
        )
        |> _Arr.filter(Boolean);
    }

    /* Filter out any app that's in user's list but not currently installed */
    data.instruments = _Arr.filter(data.instruments, instrument => {
      if (instrument.method === 'upi' && instrument['_[flow]'] === 'intent') {
        if (instrument['_[upiqr]'] === '1' && !isMobile()) {
          return true;
        }

        if (doesAppExist(instrument.upi_app, session.upi_intents_data)) {
          return true;
        }
        return false;
      }

      return true;
    });

    data.instruments = _Arr.slice(data.instruments, 0, noOfInstrumentsToShow);
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
