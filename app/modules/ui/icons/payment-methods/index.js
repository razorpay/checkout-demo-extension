import card from './card';
import emi from './emi';
import netbanking from './netbanking';
import upi from './upi';
import wallet from './wallet';
import othermethods from './othermethods';
import qr from './qr';
import paylater from './paylater';
import paypal from './paypal';
import bank_transfer from './bank_transfer';
import contact from './contact';
import upiOtm from './upi_otm';

import { getAllMethods } from 'checkoutframe/paymentmethods';

const availPaymentMethods = getAllMethods().concat(['othermethods', 'contact']);

function getIconFn(iconName) {
  switch (iconName) {
    case 'card':
      return card;

    case 'emi':
    case 'cardless_emi':
      return emi;

    case 'netbanking':
      return netbanking;

    case 'upi':
      return upi;

    case 'wallet':
      return wallet;

    case 'othermethods':
      return othermethods;

    case 'qr':
      return qr;

    case 'paylater':
      return paylater;

    case 'paypal':
      return paypal;

    case 'bank_transfer':
      return bank_transfer;

    case 'contact':
      return contact;

    case 'gpay':
      return () => '<i class="gpay-icon" />';

    case 'upi_otm':
      return upiOtm;
  }
}

export const getIcon = (
  iconName,
  { foregroundColor = '#072654', backgroundColor = '#3F71D7' }
) => {
  const iconFn = getIconFn(iconName);

  return iconFn && iconFn(foregroundColor, backgroundColor);
};

export const getIcons = options =>
  _Arr.reduce(
    availPaymentMethods,
    (result, method) => {
      result[method] = getIcon(method, options);
      return result;
    },
    {}
  );
