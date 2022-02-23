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
import tickFilledDonate from './tick_filled_donate';
import warning from './warning';
import refund from './refund';
import question from './question';
import donationHeart from './donate_heart';
import message from './message';
import lock from './lock';
import userProtect from './user_protect';
import newWindow from './new_window';
import tickFlag from './tick_flag';
import internationalIcon from './international';
import close from 'one_click_checkout/coupons/icons/close';
import offers from 'one_click_checkout/coupons/icons/offers';
import arrow_next from 'one_click_checkout/coupons/icons/arrow_next';
import rzpLogo from 'one_click_checkout/loader/icons/rzp-logo';
import location from 'one_click_checkout/address/icons/location';
import addSquare from 'one_click_checkout/address/icons/add_square';
import kebabMenu from 'one_click_checkout/address/icons/kebab_menu';
import savedCard from 'card/icons/saved-card';
import edit_phone from 'ui/icons/payment-methods/edit_phone';

import { getAllMethods } from 'checkoutframe/paymentmethods';

const availIconNames = getAllMethods().concat([
  'othermethods',
  'contact',
  'aadhaar',
  'edit',
  'present',
  'trusted_badge',
  'tick_filled_donate',
  'warning',
  'refund',
  'donate_heart',
  'question',
  'message',
  'lock',
  'user_protect',
  'tick_flag',
  'new_window',
  'close',
  'offers',
  'arrow_next',
  'saved_card',
  'rzp_logo',
  'edit_phone',
  'location',
  'add_square',
  'kebab_menu',
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

    case 'emandate':
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

    case 'tick_filled_donate':
      return tickFilledDonate;
    case 'warning':
      return warning;

    case 'refund':
      return refund;

    case 'donate_heart':
      return donationHeart;

    case 'question':
      return question;

    case 'message':
      return message;

    case 'lock':
      return lock;

    case 'user_protect':
      return userProtect;

    case 'tick_flag':
      return tickFlag;

    case 'new_window':
      return newWindow;

    case 'close':
      return close;

    case 'offers':
      return offers;

    case 'arrow_next':
      return arrow_next;

    case 'saved_card':
      return savedCard;
    case 'rzp_logo':
      return rzpLogo;
    case 'edit_phone':
      return edit_phone;

    case 'international':
      return internationalIcon;

    case 'location':
      return location;

    case 'add_square':
      return addSquare;

    case 'kebab_menu':
      return kebabMenu;
  }
}

export const getIcon = (
  iconName,
  { foregroundColor = '#072654', backgroundColor = '#3F71D7' }
) => {
  const iconFn = getIconFn(iconName);
  return iconFn && iconFn(foregroundColor, backgroundColor);
};

export const getIcons = (options) =>
  availIconNames.reduce((result, method) => {
    result[method] = getIcon(method, options);
    return result;
  }, {});
