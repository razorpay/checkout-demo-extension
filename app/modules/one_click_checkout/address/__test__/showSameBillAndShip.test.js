import { shouldShowCheckbox } from 'one_click_checkout/address/helpers';
import { views } from 'one_click_checkout/routing/constants';

describe('Same billing and shipping address checkbox', () => {
  it('hide checkbox on Add and Edit Billing Address screen in Address Form', () => {
    expect(shouldShowCheckbox(views.ADD_BILLING_ADDRESS)).toBe(false);
    expect(shouldShowCheckbox(views.EDIT_BILLING_ADDRESS)).toBe(false);
  });
  it('show checkbox for Add and Edit shipping Address screen in Address Form', () => {
    expect(shouldShowCheckbox(views.ADD_ADDRESS)).toBe(true);
    expect(shouldShowCheckbox(views.EDIT_ADDRESS)).toBe(true);
  });
});
