import stdCxLogo from "./popup/src/assets/ic-std-cx.svg";
import magicCxLogo from "./popup/src/assets/ic-magic-cx.svg";

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
];
