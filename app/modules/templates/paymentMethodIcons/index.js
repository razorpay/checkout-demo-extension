import card from './card';
import emi from './emi';
import netbanking from './netbanking';
import upi from './upi';
import wallet from './wallet';
import othermethods from './othermethods';
import qr from './qr';

const availPaymentMethods = [
  'card',
  'emi',
  'netbanking',
  'upi',
  'wallet',
  'othermethods',
  'qr',
  'cardless_emi',
];

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
