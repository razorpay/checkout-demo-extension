/* global templates, showOverlay, hideEmi, Event */
import EmiView from 'templates/views/emi.svelte';
import Razorpay from 'common/Razorpay';
import { AMEX_EMI_MIN, EMI_HELP_TEXT } from 'common/constants';
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
        _Doc.querySelector('#emi-plans') |> _El.removeClass('disabled');
      } else {
        text =
          _Doc.querySelector('#emi-bank-parent')
          |> _El.getAttribute('data-default');
        _Doc.querySelector('#emi-plans') |> _El.addClass('disabled');
      }

      if (this.prevBank !== bank) {
        _Doc.querySelector('#emi-duration').value = '';
        _Doc.querySelector('#emi-plans .text')
          |> _El.setContents(
            _Doc.querySelector('#emi-plans') |> _El.getAttribute('data-default')
          );
      }

      _Doc.querySelector('#emi-bank-parent .text') |> _El.setContents(text);

      this.prevBank = bank;
    });

    this.on('click', '#emi-bank-parent', e => {
      let listItems = [];
      let amount = session.get('amount');
      let prevBank = _Doc.querySelector('#emi-bank').value;

      this.opts.banks
        |> _Obj.loop((bankObj, bankCode) => {
          if (bankCode === 'AMEX') {
            if (
              (session.isOfferApplicableOnIssuer('amex')
                ? session.getDiscountedAmount()
                : amount) > AMEX_EMI_MIN
            ) {
              listItems.push({ text: bankObj.name, value: bankCode });
            }
          } else if (amount) {
            listItems.push({ text: bankObj.name, value: bankCode });
          }
        });

      if (listItems.length === 0) {
        e.target |> _El.addClass('mature invalid');
        return;
      } else {
        e.target |> _El.removeClass('invalid');
      }

      if (session.tab === 'card') {
        listItems.push({ text: 'Pay without EMI', value: '' });
      }

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
          _Doc.querySelector('#emi-bank')
            |> _El.removeClass('mature')
            |> _El.removeClass('invalid');
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
        let plans = this.opts.banks[emiBank].plans;

        if (session.isOfferApplicableOnIssuer(emiBank)) {
          amount = session.getDiscountedAmount();
        }

        let appliedOffer =
          session.offers && session.offers.offerSelectedByDrawer;
        let listItems =
          plans
          |> _Obj.reduce((accumulator, plan, duration) => {
            if (
              !appliedOffer ||
              (appliedOffer &&
                appliedOffer.id &&
                appliedOffer.id === plan.offer_id)
            ) {
              accumulator.push({
                text: emiText(plan),
                value: duration,
                badge: plan.subvention === 'merchant' ? 'No cost EMI' : false,
              });
            }
            return accumulator;
          }, []);

        if (listItems.length === 0) {
          if (appliedOffer) {
            _Doc.querySelector('#emi-plans .help')
              |> _El.setContents(
                'Entered card number is not applicable for the selected offer'
              );
          } else {
            _Doc.querySelector('#emi-plans .help')
              |> _El.setContents(EMI_HELP_TEXT);
          }
          if (session.tab === 'emi') {
            e.target |> _El.addClass('mature invalid');
          } else {
            e.target |> _El.addClass('mature');
          }
          return;
        } else {
          e.target |> _El.removeClass('invalid') |> _El.removeClass('mature');
        }

        if (!appliedOffer && session.tab === 'card') {
          listItems.push({
            text: 'Pay without EMI',
            value: '',
          });
        }

        OptionsList.show({
          target: _Doc.querySelector('#options-wrap'),
          data: {
            listItems: listItems,
          },
          onSelect: value => {
            let text = '';
            let removeOffer = false;
            if (value) {
              var plan = plans[value];
              text = emiText(plan);

              if (plan.offer_id) {
                if (session.offers) {
                  session.offers.selectOfferById(plan.offer_id);
                }
              } else {
                removeOffer = true;
              }
            } else {
              removeOffer = true;
              text =
                _Doc.querySelector('#emi-plans')
                |> _El.getAttribute('data-default');
            }

            if (removeOffer && session.offers && session.offers.appliedOffer) {
              session.offers.removeOffer();
            }

            _Doc.querySelector('#emi-duration').value = value;
            _Doc.querySelector('#emi-plans')
              |> _El.removeClass('mature')
              |> _El.removeClass('invalid');
            _Doc.querySelector('#emi-plans .text') |> _El.setContents(text);
          },
        });
      } else {
        _Doc.querySelector('#emi-plans .help')
          |> _El.setContents(EMI_HELP_TEXT);
        e.target |> _El.addClass('mature');
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
