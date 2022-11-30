import * as contactStorage from 'checkoutframe/contact-storage';
import BrowserStorage from 'browserstorage';
import { disableEmailAsCookie } from 'razorpay';
jest.mock('razorpay', () => ({
  disableEmailAsCookie: jest.fn(() => {}),
}));

describe('Module: checkoutframe/contact-storage', () => {
  it('should update details in local storage', () => {
    (disableEmailAsCookie as unknown as jest.Mock).mockReturnValue(false);
    const details = { contact: '123456789', email: 'def@gmail.com' };
    contactStorage.update(details);
    const expectedLocalUpdatedValue = JSON.parse(
      BrowserStorage.getItem('rzp_contact') || '{}'
    );
    expect(expectedLocalUpdatedValue).toEqual(details);
  });
  it('should not update details in local storage', () => {
    (disableEmailAsCookie as unknown as jest.Mock).mockReturnValue(true);
    const details = { contact: '8888888888', email: 'fgh@gmail.com' };
    contactStorage.update(details);
    const expectedLocalUpdatedValue = JSON.parse(
      BrowserStorage.getItem('rzp_contact') || '{}'
    );
    expect(expectedLocalUpdatedValue).not.toEqual(details);
  });
  it('should get latest updated details from local storage', () => {
    (disableEmailAsCookie as unknown as jest.Mock).mockReturnValue(false);
    const details = { contact: '9876543210', email: 'abc@gmail.com' };
    contactStorage.update(details);
    expect(contactStorage.get()).toEqual(details);
  });
});
