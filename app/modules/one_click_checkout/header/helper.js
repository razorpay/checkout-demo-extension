import { isOneClickCheckout } from 'razorpay';
import { headerVisible } from 'one_click_checkout/header/store';

export const toggleHeader = (show) => {
  if (isOneClickCheckout()) {
    headerVisible.set(show);
  }
};
