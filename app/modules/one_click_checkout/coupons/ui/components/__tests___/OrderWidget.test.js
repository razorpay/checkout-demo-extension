import { getByTestId, getByText, render } from '@testing-library/svelte';
import OrderWidget from 'one_click_checkout/coupons/ui/components/OrderWidget.svelte';
import { savedAddresses } from 'one_click_checkout/address/store';
import {
  cartAmount,
  cartDiscount,
  shippingCharge,
  isShippingAddedToAmount,
  initializeCharges,
} from 'one_click_checkout/charges/store';
import { checkServiceabilityStatus } from 'one_click_checkout/address/shipping_address/store';
import {
  areAllCartItemsShown,
  cartItems,
  enableCart,
} from 'one_click_checkout/cart/store';
import {
  appliedCoupon,
  couponInputValue,
  isCouponApplied,
} from 'one_click_checkout/coupons/store';
import { SERVICEABILITY_STATUS } from 'one_click_checkout/address/constants';

jest.mock('sessionmanager', () => ({
  getSession: jest.fn(() => ({
    get: jest.fn(),
    bindEvents: jest.fn(),
    setAmount: jest.fn(),
  })),
}));

describe('Order widget tests', () => {
  initializeCharges(9900);
  it('Should show the price if no other charges are applicable', () => {
    const { getByText, getByTestId } = render(OrderWidget);

    expect(getByText('Price')).toBeInTheDocument();
    expect(getByTestId('cart-amount')).toHaveTextContent('99');
  });

  it('Should show delivery charges and total when applicable', () => {
    // savedAddresses conditions in this component only check length
    savedAddresses.set(['one address']);
    isShippingAddedToAmount.set(true);
    shippingCharge.set(1000);
    checkServiceabilityStatus.set(SERVICEABILITY_STATUS.CHECKED);
    const { getByText, getByTestId } = render(OrderWidget);

    expect(getByText('Price')).toBeInTheDocument();
    expect(getByTestId('cart-amount')).toHaveTextContent('99');
    expect(getByText('Delivery Charges')).toBeInTheDocument();
    expect(getByTestId('shipping-amount')).toHaveTextContent('10');
    expect(getByText('Total Amount')).toBeInTheDocument();
    expect(getByTestId('total-amount')).toHaveTextContent('109');
  });

  it('Should show applied coupon charges/discounts when applicable', () => {
    isCouponApplied.set(true);
    appliedCoupon.set('DISC5');
    couponInputValue.set('DISC5');
    cartDiscount.set(500);

    const { getByText, getByTestId } = render(OrderWidget);

    expect(getByText('Price')).toBeInTheDocument();
    expect(getByTestId('cart-amount')).toHaveTextContent('99');
    expect(getByText('Coupon (DISC5)')).toBeInTheDocument();
    expect(getByTestId('discount-amount')).toHaveTextContent('5');
    expect(getByText('Delivery Charges')).toBeInTheDocument();
    expect(getByTestId('shipping-amount')).toHaveTextContent('10');
    expect(getByText('Total Amount')).toBeInTheDocument();
    expect(getByTestId('total-amount')).toHaveTextContent('104');
  });

  it('Should show coupon discount and total when no saved addresses', () => {
    savedAddresses.set([]);
    isShippingAddedToAmount.set(false);
    shippingCharge.set(0);

    const { getByText, getByTestId } = render(OrderWidget);

    expect(getByText('Price')).toBeInTheDocument();
    expect(getByTestId('cart-amount')).toHaveTextContent('99');
    expect(getByText('Coupon (DISC5)')).toBeInTheDocument();
    expect(getByTestId('discount-amount')).toHaveTextContent('5');
    expect(getByText('Total Amount')).toBeInTheDocument();
    expect(getByTestId('total-amount')).toHaveTextContent('94');
  });

  it('Should not show delivery and total charges when serviceability status has not updated', () => {
    isCouponApplied.set(false);
    appliedCoupon.set('');
    couponInputValue.set('');
    cartDiscount.set(0);

    savedAddresses.set(['one address']);
    isShippingAddedToAmount.set(true);
    shippingCharge.set(1000);
    checkServiceabilityStatus.set(SERVICEABILITY_STATUS.LOADING);

    const { getByText, getByTestId, queryByText, queryByTestId } =
      render(OrderWidget);

    expect(getByText('Price')).toBeInTheDocument();
    expect(getByTestId('cart-amount')).toHaveTextContent('99');
    expect(queryByText('Delivery Charges')).not.toBeInTheDocument();
    expect(queryByTestId('shipping-amount')).not.toBeInTheDocument();
    expect(queryByText('Total Amount')).not.toBeInTheDocument();
    expect(queryByTestId('total-amount')).not.toBeInTheDocument();
  });
});
