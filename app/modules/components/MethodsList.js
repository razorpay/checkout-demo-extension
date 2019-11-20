import MethodsListView from 'templates/views/ui/methods/MethodsList.svelte';
import OtherMethodsView from 'templates/views/ui/methods/OtherMethods.svelte';
import { doesAppExist } from 'common/upi';
import Analytics from 'analytics';
import * as AnalyticsTypes from 'analytics-types';
import { isMobile } from 'common/useragent';
import { AVAILABLE_METHODS } from 'common/constants';
import { createInstrumentFromPayment } from 'checkoutframe/personalization';
import { getSession } from 'sessionmanager';
import { hideCta, showCtaWithDefaultText } from 'checkoutstore/cta';

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
  constructor({ target, props }) {
    const session = getSession();
    props.AVAILABLE_METHODS = getAvailableMethods(session.methods);

    // We do not want to show PayPal in the list in case of international
    if (session.international) {
      props.AVAILABLE_METHODS = _Arr.remove(props.AVAILABLE_METHODS, 'paypal');
    }

    this.view = new MethodsListView({
      target: _Doc.querySelector(target),
      props,
    });

    this.otherMethodsView = new OtherMethodsView({
      target: _Doc.querySelector('#other-methods'),
      props,
    });

    /* This is to set default screen in the view */
    this.view.$set({
      showMessage: session.p13n,
    });

    this.animateNext = props.animate;

    this.props = props;
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
    this.view.$on('select', event => {
      showCtaWithDefaultText();
      this.selectedInstrument = event.detail;
    });

    this.view.$on('showMethods', () => {
      this.otherMethodsView.$set({
        visible: true,
      });

      Analytics.track('p13n:methods:show', {
        type: AnalyticsTypes.BEHAV,
      });

      hideCta();
    });

    this.otherMethodsView.$on('hideMethods', () => {
      this.otherMethodsView.$set({
        visible: false,
      });

      Analytics.track('p13n:methods:hide', {
        type: AnalyticsTypes.BEHAV,
      });

      if (this.view.selected) {
        showCtaWithDefaultText();
      }
    });

    const onMethodSelected = event => {
      let { method, down } = event.detail;

      if (down) {
        return;
      }

      getSession().switchTab(method);
    };

    this.view.$on('methodSelected', onMethodSelected);
    this.otherMethodsView.$on('methodSelected', onMethodSelected);
  }

  $destroy() {
    this.view.$destroy();
  }

  set(props) {
    const session = getSession();
    if (!props.instruments && props.customer) {
      /* Just setting customer here (login/logout), rest does not change */
      return this.view.$set(props);
    }

    props = _Obj.clone(props);

    /**
     * This count is also being sent with the
     * p13n:instruments:list event.
     */
    let noOfInstrumentsToShow = 2;
    if (isMobile()) {
      /**
       * We want to show 3 instruments on mobile devices, since we have more height.
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
       * props.instruments should contain only PayPal
       */
      if (session.get().personalization === false) {
        props.instruments = [];
      }

      props.instruments =
        props.instruments
        |> _Arr.insertAt(
          createInstrumentFromPayment({
            method: 'paypal',
          }),
          noOfInstrumentsToShow - 1
        )
        |> _Arr.filter(Boolean);
    }

    /* Filter out any app that's in user's list but not currently installed */
    props.instruments = _Arr.filter(props.instruments, instrument => {
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

    props.instruments = _Arr.slice(props.instruments, 0, noOfInstrumentsToShow);
    props.selected = null;
    this.selectedInstrument = null;

    var delay = 1500;

    if (this.animateNext === false) {
      delay = 0;
      props.animate = false;
      this.animateNext = true;
    }

    this.view.$set(props);
    this.otherMethodsView.$set(props);
  }
}
