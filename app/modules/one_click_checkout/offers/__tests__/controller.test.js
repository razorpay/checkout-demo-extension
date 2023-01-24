import { setOffersInSessionAndStore } from '../controller';
import { getSession } from 'sessionmanager';
import RazorpayStore from 'razorpay';

jest.mock('sessionmanager', () => ({
  getSession: jest.fn(() => ({ setOffers: jest.fn(() => true) })),
}));

jest.mock('razorpay', () => ({
  ...jest.requireActual('razorpay'),
  get: jest.fn(() => ({})),
  updateInstance: jest.fn(),
}));

describe('magic offers controller tests', () => {
  it('Should get the razorpay instance once', () => {
    setOffersInSessionAndStore('prefs');
    expect(RazorpayStore.get).toHaveBeenCalledTimes(1);
    expect(getSession).toHaveBeenCalledTimes(1);
  });

  it('Should update the rzp instance once', () => {
    setOffersInSessionAndStore('prefs');
    expect(RazorpayStore.updateInstance).toHaveBeenCalledWith({
      preferences: 'prefs',
    });
  });
});
