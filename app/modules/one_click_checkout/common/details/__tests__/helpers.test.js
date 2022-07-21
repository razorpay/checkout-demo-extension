import { views } from 'one_click_checkout/routing/constants';
import { navigator } from 'one_click_checkout/routing/helpers/routing';
import * as helpers from 'one_click_checkout/common/details/helpers';
import { redirectToMethods } from 'one_click_checkout/sessionInterface';
import { handleContactFlow } from 'one_click_checkout/common/details/handleContactFlow';
import { isEditContactFlow } from 'one_click_checkout/store';

jest.mock('one_click_checkout/store', () => {
  const { writable } = jest.requireActual('svelte/store');
  const originalModule = jest.requireActual('one_click_checkout/store');
  return {
    __esModule: true,
    ...originalModule,
    isEditContactFlow: writable(true),
  };
});

jest.mock('checkoutstore/screens/home', () => {
  const { writable } = jest.requireActual('svelte/store');
  const originalModule = jest.requireActual('checkoutstore/screens/home');
  return {
    __esModule: true,
    ...originalModule,
    contact: writable('+919999999999'),
    email: writable('test@razorpay.com'),
  };
});

jest.mock('one_click_checkout/header/helper', () => {
  const originalModule = jest.requireActual('one_click_checkout/header/helper');
  return {
    __esModule: true,
    ...originalModule,
    toggleHeader: jest.fn(),
  };
});

jest.mock('one_click_checkout/order/controller', () => {
  const originalModule = jest.requireActual(
    'one_click_checkout/order/controller'
  );
  return {
    __esModule: true,
    ...originalModule,
    updateOrderWithCustomerDetails: jest.fn(),
  };
});

jest.mock('one_click_checkout/routing/helpers/routing', () => {
  const originalModule = jest.requireActual(
    'one_click_checkout/routing/helpers/routing'
  );
  return {
    __esModule: true,
    ...originalModule,
    navigator: {
      navigateTo: jest.fn(),
      navigateBack: jest.fn(),
      isRedirectionFromMethods: jest.fn(),
    },
  };
});

jest.mock('one_click_checkout/sessionInterface', () => {
  const originalModule = jest.requireActual(
    'one_click_checkout/sessionInterface'
  );
  return {
    __esModule: true,
    ...originalModule,
    redirectToMethods: jest.fn(),
  };
});

beforeEach(() => {
  isEditContactFlow.set(true);
});

jest.mock('one_click_checkout/common/details/handleContactFlow', () => {
  const originalModule = jest.requireActual(
    'one_click_checkout/common/details/handleContactFlow'
  );
  return {
    __esModule: true,
    ...originalModule,
    handleContactFlow: jest.fn(),
  };
});

describe('handleDetailsNext method', () => {
  it('should navigate to coupons if details are changed', () => {
    handleContactFlow.mockReturnValue(true);

    helpers.handleDetailsNext('+91999999998');

    expect(navigator.navigateTo.mock.calls[0][0].path).toEqual(views.COUPONS);
  });

  it('should redirect to last page if details are not changed', () => {
    handleContactFlow.mockReturnValue(false);

    helpers.handleDetailsNext('+91999999999');

    expect(navigator.navigateBack).toHaveBeenCalled();
  });

  it('should redirect to payments page if edited from methods and details are not changed', () => {
    handleContactFlow.mockReturnValue(false);
    navigator.isRedirectionFromMethods.mockReturnValue(true);

    helpers.handleDetailsNext('+91999999999');

    expect(navigator.navigateBack).toHaveBeenCalled();
    expect(redirectToMethods).toHaveBeenCalled();
  });
});
