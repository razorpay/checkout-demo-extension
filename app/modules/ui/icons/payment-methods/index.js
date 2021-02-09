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
import aadhaar from './aadhaar';
import edit from './edit';
import present from './present';
import trustedBadge from './trusted_badge';
import tickFilled from './tick_filled';

import { getAllMethods } from 'checkoutframe/paymentmethods';

const availIconNames = getAllMethods().concat([
  'othermethods',
  'contact',
  'aadhaar',
  'edit',
  'present',
  'trusted_badge',
  'tick_filled',
]);

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

    case 'aadhaar':
      return aadhaar;

    case 'edit':
      return edit;

    case 'present':
      return present;
    case 'trusted_badge':
      return trustedBadge;

    case 'tick_filled':
      return tickFilled;
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
    availIconNames,
    (result, method) => {
      result[method] = getIcon(method, options);
      return result;
    },
    {}
  );
