import { getCustomerDetails } from 'one_click_checkout/common/helpers/customer';
import { views } from 'one_click_checkout/routing/constants';

const isAuthenticated = () => {
  const customer = getCustomerDetails();

  if (!customer.logged) {
    return views.OTP;
  }
};

export default isAuthenticated;
