import { isOffersAvailable } from '../cache';

describe('magic offers cache', () => {
  it('Should return true if offers are available', () => {
    const returnVal = isOffersAvailable({ offers: ['offer1'] }, 'order_1');
    expect(returnVal).toBeTruthy();
  });

  it('Should return false if offers are not available', () => {
    const returnVal = isOffersAvailable({ offers: [] }, 'order_1');
    expect(returnVal).toBeTruthy();
  });

  it('Should return true if once set with offers', () => {
    const returnVal = isOffersAvailable({ offers: ['offer1'] }, 'order_1');
    const returnVal2 = isOffersAvailable({ offers: [] }, 'order_1');

    expect(returnVal).toBeTruthy();
    expect(returnVal2).toBeTruthy();
  });

  it('Should return new value for different order', () => {
    const returnVal = isOffersAvailable({ offers: ['offer1'] }, 'order_1');
    const returnVal2 = isOffersAvailable({ offers: [] }, 'order_2');

    expect(returnVal).toBeTruthy();
    expect(returnVal2).toBeFalsy();
  });
});
