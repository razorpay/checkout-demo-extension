import MethodsListView from 'templates/views/ui/methods/MethodsList.svelte';
import { doesAppExist } from 'common/upi';

const REPLACE_METHODS = {
  emi: 'cardless_emi',
};

const AVAILABLE_METHODS = [
  'card',
  'netbanking',
  'wallet',
  'upi',
  'emi',
  'cardless_emi',
  'qr',
];

/**
 * Get the available methods.
 *
 * @param {Object} methods
 *
 * @return {Array}
 */
const getAvailableMethods = methods => {
  const AVAIL_METHODS = _Arr.filter(
    AVAILABLE_METHODS,
    method => methods[method]
  );

  _Obj.loop(REPLACE_METHODS, (newMethod, originalMethod) => {
    const containsOriginal = _Arr.contains(AVAIL_METHODS, originalMethod);
    const containsNew = _Arr.contains(AVAIL_METHODS, newMethod);

    if (containsOriginal && containsNew) {
      // Delete new
      AVAIL_METHODS.splice(_Arr.indexOf(AVAIL_METHODS, newMethod), 1);
    } else if (!containsOriginal && containsNew) {
      // Replace new with original
      AVAIL_METHODS[_Arr.indexOf(AVAIL_METHODS, newMethod)] = originalMethod;
    }
  });

  return AVAIL_METHODS;
};

export default class MethodsList {
  constructor({ target, data }) {
    data.AVAILABLE_METHODS = getAvailableMethods(data.session.methods);

    this.view = new MethodsListView({
      target: _Doc.querySelector(target),
      data,
    });

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
      this.view.set({
        showOtherMethods: true,
      });

      _Doc.querySelector('#body') |> _El.removeClass('sub');
      _Doc.querySelector('#methods-list') |> _El.setStyle('position', 'static');
    });

    this.view.on('hideMethods', e => {
      this.view.set({
        showOtherMethods: false,
      });

      if (this.view.get().selected) {
        _Doc.querySelector('#body') |> _El.addClass('sub');
      }

      setTimeout(
        _ =>
          _Doc.querySelector('#methods-list') |> _El.setAttribute('style', ''),
        200
      );
    });

    this.view.on('methodSelected', e => {
      let data = e.data;

      /**
       * Replace the method if replaceable.
       */
      if (
        REPLACE_METHODS[data.method] &&
        this.data.session.methods[REPLACE_METHODS[data.method]]
      ) {
        data.method = REPLACE_METHODS[data.method];
      }

      this.data.session.switchTab(data.method);
    });
  }

  destroy() {
    this.view.destroy();
  }

  set(data) {
    if (!data.instruments && data.customer) {
      /* Just setting customer here (login/logout), rest does not change */
      return this.view.set(data);
    }

    data = _Obj.clone(data);
    let noOfInstruments = 2;
    if (this.data.session.isMobile) {
      noOfInstruments = 3;
    }

    /* Only allow for available methods */
    data.instruments = _Arr.filter(data.instruments, ({ method }) => {
      return this.data.session.methods[method];
    });

    /* Filter out any app that's in user's list but not currently installed */
    data.instruments = _Arr.filter(data.instruments, instrument => {
      if (instrument.method === 'upi' && instrument['_[flow]'] === 'intent') {
        if (
          doesAppExist(instrument.upi_app, this.data.session.upi_intents_data)
        ) {
          return true;
        }
        return false;
      }

      return true;
    });

    data.instruments = _Arr.slice(data.instruments, 0, noOfInstruments);
    data.selected = null;
    this.selectedInstrument = null;

    this.view.set(data);

    /* handles the race condition */
    if (this.animationTimeout) {
      global.clearTimeout(this.animationTimeout);
    }

    if (data.instruments && data.instruments.length) {
      this.animationTimeout = global.setTimeout(() => {
        _Doc.querySelector('#payment-options') |> _El.addClass('hidden');

        if (!this.hasLongClass) {
          _Doc.querySelector('#container') |> _El.addClass('long');
        }

        if (this.view.get().selected) {
          _Doc.querySelector('#body') |> _El.addClass('sub');
        }
      }, 1500);
    } else {
      _Doc.querySelector('#payment-options') |> _El.removeClass('hidden');
      _Doc.querySelector('#body') |> _El.removeClass('sub');

      if (!this.hasLongClass) {
        _Doc.querySelector('#container') |> _El.removeClass('long');
      }
    }
  }
}
