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
import offlineChallan from './offlineChallan';
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
import intlBankTransferIcon from './intl_bank_transfer';
import close from 'one_click_checkout/coupons/icons/close';
import offers from 'one_click_checkout/coupons/icons/offers';
import arrow_next from 'one_click_checkout/coupons/icons/arrow_next';
import circle_arrow_next from 'one_click_checkout/coupons/icons/circle_arrow_next';
import no_coupons from 'one_click_checkout/coupons/icons/no_coupons';
import arrow_down from 'one_click_checkout/coupons/icons/arrow_down';
import order from 'one_click_checkout/coupons/icons/order';
import rzpLogo from 'one_click_checkout/loader/icons/rzp-logo';
import location from 'one_click_checkout/address/icons/location';
import addSquare from 'one_click_checkout/address/icons/add_square';
import kebabMenu from 'one_click_checkout/address/icons/kebab_menu';
import savedCard from 'card/icons/saved-card';
import edit_phone from 'ui/icons/payment-methods/edit_phone';
import info from 'ui/icons/payment-methods/info';
import back_arrow from 'icons/back_arrow';
import double_arrow from 'one_click_checkout/topbar/icons/double_arrow';
import rzp_brand_logo from 'account_modal/icons/rzp_brand_logo';
import circle_check from 'one_click_checkout/rtb_modal/icons/circle_check';
import rtb_close from 'one_click_checkout/rtb_modal/icons/rtb_close';
import edit_pen from 'one_click_checkout/otp/icons/edit_pen';
import edit_paper from 'ui/icons/payment-methods/edit_paper';
import user from 'one_click_checkout/contact_widget/icons/user';
import caret_circle_right from 'one_click_checkout/address/icons/caret_circle_right';
import solid_down_arrow from 'one_click_checkout/address/icons/solid_down_arrow';
import consent_location from 'one_click_checkout/address/consent/icons/location';
import { AVAILABLE_METHODS } from 'common/constants';

/**
 * Don't use getAllMethods which is functional representation for AVAILABLE_METHODS, as its creating CIRCULAR DEPENDENCY
 */

// const AVAILABLE_METHOD = [...AVAILABLE_METHODS] as const;
// type NeededUnionType = typeof AVAILABLE_METHOD[number];

const availIconNames = [
  ...AVAILABLE_METHODS,
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
  'info',
  'back_arrow',
  'double_arrow',
  'rzp_brand_logo',
  'circle_check',
  'rtb_close',
  'circle_arrow_next',
  'no_coupons',
  'arrow_down',
  'order',
  'edit_pen',
  'edit_paper',
  'location',
  'add_square',
  'kebab_menu',
  'info',
  'user',
  'caret_circle_right',
  'solid_down_arrow',
  'consent_location',
] as const;

type IconSupported = typeof availIconNames[number];

function getIconFn(iconName: IconSupported) {
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
    case 'nach':
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

    case 'circle_arrow_next':
      return circle_arrow_next;

    case 'no_coupons':
      return no_coupons;

    case 'order':
      return order;

    case 'arrow_down':
      return arrow_down;

    case 'saved_card':
      return savedCard;

    case 'rzp_logo':
      return rzpLogo;

    case 'edit_phone':
      return edit_phone;

    case 'info':
      return info;

    case 'international':
      return internationalIcon;

    case 'back_arrow':
      return back_arrow;

    case 'double_arrow':
      return double_arrow;

    case 'rzp_brand_logo':
      return rzp_brand_logo;

    case 'circle_check':
      return circle_check;

    case 'rtb_close':
      return rtb_close;

    case 'edit_pen':
      return edit_pen;

    case 'edit_paper':
      return edit_paper;

    case 'location':
      return location;

    case 'add_square':
      return addSquare;

    case 'kebab_menu':
      return kebabMenu;

    case 'user':
      return user;

    case 'caret_circle_right':
      return caret_circle_right;

    case 'offline_challan':
      return offlineChallan;

    case 'solid_down_arrow':
      return solid_down_arrow;

    case 'consent_location':
      return consent_location;

    case 'intl_bank_transfer':
      return intlBankTransferIcon;
  }
}

export const getIcon = (
  iconName: IconSupported,
  { foregroundColor = '#072654', backgroundColor = '#3F71D7' }
) => {
  const iconFn = getIconFn(iconName);
  return iconFn && iconFn(foregroundColor, backgroundColor);
};

export const getIcons = (options: {
  backgroundColor: string;
  foregroundColor: string;
}) =>
  availIconNames.reduce(
    (result: { [key in IconSupported]?: string }, method) => {
      result[method] = getIcon(method, options);
      return result;
    },
    {}
  );