import stdCxLogo from "./popup/src/assets/ic-std-cx.svg";
import magicCxLogo from "./popup/src/assets/ic-magic-cx.svg";
import crossborderLogo from "./popup/src/assets/ic-cross-border.svg";
import offersLogo from "./popup/src/assets/ic-offers.svg";

export const EVENT_TYPES = {
  SET_OPTIONS: "SET_OPTIONS",
  TOGGLE_INSPECTOR: "TOGGLE_INSPECTOR",
  SET_SCRAPED_DATA: "SET_SCRAPED_DATA",
  GET_SCRAPED_DATA: "GET_SCRAPED_DATA",
  SET_ORDER_ID: "SET_ORDER_ID",
  GET_ORDER_ID: "GET_ORDER_ID",
  SET_ACTIVE_PRODUCT: "SET_ACTIVE_PRODUCT",
  GET_ACTIVE_PRODUCT: "GET_ACTIVE_PRODUCT",
};

export const MENU = [
  {
    id: "standard-cx",
    icon: stdCxLogo,
    label: "Standard Checkout",
  },
  {
    id: "magic-cx",
    icon: magicCxLogo,
    label: "Magic Checkout",
  },
  {
    id: "cross-border",
    icon: crossborderLogo,
    label: "Cross Border",
  },
  {
    id: "offers",
    icon: offersLogo,
    label: "Offers",
  },
];

export const DEFAULT_CX_OPTIONS = {
  key: "rzp_test_1DP5mmOlF5G5ag",
  amount: 100,
  currency: "INR",
};
