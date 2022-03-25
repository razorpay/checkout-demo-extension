import { showAccountTab } from 'one_click_checkout/account_modal/store';
import { isOneClickCheckout } from 'razorpay';

export function isShowAccountTab(element) {
  if (isOneClickCheckout() && element) {
    const {
      offsetHeight, // Visible height of the element
      scrollHeight, // Actual height of the element
      scrollTop, // How much has already been scrolled
      clientHeight, // viewable height of an element
    } = element;

    const isContentOverflowing = scrollHeight > offsetHeight;
    if (isContentOverflowing) {
      const extraHeight = scrollHeight - clientHeight;
      const currentPosition = scrollTop / extraHeight;
      const screenEnd = 1;
      const scrollTopPosition = 0.1;
      // remove the Account tab during scroll top
      if (currentPosition < scrollTopPosition) {
        showAccountTab.set(false);
      }
      // currentPosition value range between 0 to 1 and 1 indicates the end of the current Screen
      if (currentPosition === screenEnd) {
        setTimeout(() => {
          showAccountTab.set(true);
        }, 500);
      }
    }
  }
}
