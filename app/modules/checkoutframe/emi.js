/* global templates, showOverlay, hideEmi, Event */
import EmiView from 'templates/views/emi.svelte';
import Razorpay from 'common/Razorpay';
import { AMEX_EMI_MIN } from 'common/constants';
import * as OptionsList from 'components/OptionsList';

function selectEMIBank(e) {
  const { target } = e;

  if (target |> _El.hasClass('option')) {
    const duration = target |> _El.getAttribute('value');
    const parent = _Doc.querySelector('#emi-check-label');
    const input = parent.querySelector('input[type=checkbox]');
    const active = parent.querySelector('.active');

    input.checked = Boolean(duration);
    if (active) {
      active |> _El.removeClass('active');
    }
    target |> _El.addClass('active');

    setTimeout(() => {
      parent.blur();
    });
  }
}

function hideEMIDropdown() {
  const body = _Doc.querySelector('#body');
  const parent = _Doc.querySelector('#emi-check-label');

  if (body |> _El.hasClass('emi-focus')) {
    body |> _El.removeClass('emi-focus');
    parent |> _El.removeClass('focus');
  }
}

function showEMIDropdown() {
  const body = _Doc.querySelector('#body');
  const parent = _Doc.querySelector('#emi-check-label');

  body |> _El.addClass('emi-focus');
  parent |> _El.addClass('focus');
}

export default function emiView(session) {
  const opts = session.emi_options;

  const amount = (opts.amount = session.get('amount')),
    offer = session.getAppliedOffer(),
    discountedAmount = session.getDiscountedAmount();

  if (
    amount > AMEX_EMI_MIN &&
    (!session.isOfferApplicableOnIssuer('amex', offer) ||
      discountedAmount > AMEX_EMI_MIN)
  ) {
    const help = _Doc.querySelector('#elem-emi .help');

    /* TODO: improve bank name listing */
    help
      |> _El.setContents(
        help.innerHTML.replace(' & Axis Bank', ', Axis & AMEX')
      );
  } else {
    delete opts.banks.AMEX;
  }

  this.session = session;
  opts.discountedAmount = discountedAmount;

  this.opts = opts;
  this.listeners = [];
  this.render();
}

emiView.prototype = {
  render() {
    const wrap = _Doc.querySelector('#emi-wrap');

    this.unbind();
    let defaultBank = _Obj.keys(this.opts.banks)[0];

    this.view = new EmiView({
      target: wrap,
      data: {
        selected: defaultBank,
        banks: this.opts.banks,
        session: this.session,
      },
    });

    this.bind();
  },

  on: function(event, sel, listener) {
    const el = _Doc.querySelector(sel);

    this.listeners.push(el |> _El.on(event, listener));
  },

  bind() {
    let session = this.session;

    this.on('change', '#emi-bank', e => {
      let bank = e.target.value;
      let text = '';

      if (bank) {
        text = this.opts.banks[bank].name;
      } else {
        text =
          _Doc.querySelector('#emi-bank-parent')
          |> _El.getAttribute('data-default');

        _Doc.querySelector('#emi-duration').value = '';
        _Doc.querySelector('#emi-plans .text')
          |> _El.setContents(
            _Doc.querySelector('#emi-plans') |> _El.getAttribute('data-default')
          );
      }

      _Doc.querySelector('#emi-bank-parent .text') |> _El.setContents(text);
    });

    this.on('click', '#emi-bank-parent', e => {
      let listItems = [];
      let amount = session.get('amount');
      let prevBank = _Doc.querySelector('#emi-bank').value;

      this.opts.banks
        |> _Obj.loop((bankObj, bankCode) => {
          if (bankCode === 'AMEX') {
            if (amount > AMEX_EMI_MIN) {
              listItems.push({ text: bankObj.name, value: bankCode });
            }
          } else if (amount) {
            listItems.push({ text: bankObj.name, value: bankCode });
          }
        });

      listItems.push({ text: 'Pay without EMI', value: '' });

      OptionsList.show({
        target: _Doc.querySelector('#options-wrap'),
        data: {
          listItems: listItems,
        },
        onSelect: value => {
          if (value) {
            if (
              _Doc.querySelector('#card_number').value.length > 6 &&
              prevBank !== value
            ) {
              _Doc.querySelector('#card_number').value = '';

              _Doc.querySelector('#emi-duration').value = '';
              _Doc.querySelector('#emi-plans .text')
                |> _El.setContents(
                  _Doc.querySelector('#emi-plans')
                    |> _El.getAttribute('data-default')
                );
            }
          }

          _Doc.querySelector('#emi-bank').value = value;
          _Doc.querySelector('#emi-bank').dispatchEvent(new Event('change'));
        },
      });
    });

    this.on('click', '#emi-plans', e => {
      let emiBank = _Doc.querySelector('#emi-bank').value;
      let amount = session.get('amount');
      let emiText = plan => {
        let amountPerMonth = Razorpay.emi.calculator(
          amount,
          plan.duration,
          plan.interest
        );
        amountPerMonth = (amountPerMonth / 100).toFixed(2);

        return `${plan.duration} Months (₹${amountPerMonth}/month) @ <b>${
          plan.interest
        }%</b>`;
      };

      if (emiBank) {
        var plans = this.opts.banks[emiBank].plans;

        let listItems =
          plans
          |> _Obj.reduce((accumulator, plan, duration) => {
            accumulator.push({
              text: emiText(plan),
              value: duration,
            });
            return accumulator;
          }, []);

        listItems.push({
          text: 'Pay without EMI',
          value: '',
        });

        OptionsList.show({
          target: _Doc.querySelector('#options-wrap'),
          data: {
            listItems: listItems,
          },
          onSelect: value => {
            var text = '';
            if (value) {
              text = emiText(plans[value]);
            } else {
              text =
                _Doc.querySelector('#emi-plans')
                |> _El.getAttribute('data-default');
            }

            _Doc.querySelector('#emi-duration').value = value;
            _Doc.querySelector('#emi-plans .text') |> _El.setContents(text);
          },
        });
      }
    });

    this.on(
      'click',
      '#container',
      function(e) {
        if (e.target.id !== 'emi-check-label') {
          hideEMIDropdown();
        }
      },
      true
    );

    // this.on('click', '#emi-select', function(e) {
    //   hideEMIDropdown();
    //   return e.stopPropagation();
    // });

    // this.on('mousedown', '#emi-select', selectEMIBank);

    this.on('click', '#view-emi-plans', function() {
      // TODO: Update showOverlay once session.js is refactored.
      showOverlay({ 0: _Doc.querySelector('#emi-wrap') });
    });
  },

  unbind: function() {
    _Arr.loop(this.listeners, function(delistener) {
      delistener();
    });
    this.listeners = [];
  },
};
