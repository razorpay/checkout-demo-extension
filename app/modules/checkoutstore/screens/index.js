import OtpStore from './otp';
import { composeStore } from 'checkoutstore/create';

export const otp = OtpStore;

export default composeStore({
  otp: OtpStore,
});
