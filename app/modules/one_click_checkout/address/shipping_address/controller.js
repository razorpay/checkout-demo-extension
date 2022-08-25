import { isShippingAddedToAmount } from "one_click_checkout/charges/store";

export function removeShippingCharges() {
  isShippingAddedToAmount.set(false);
}
