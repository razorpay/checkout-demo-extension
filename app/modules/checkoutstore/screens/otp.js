import { createStore } from 'checkoutstore/create';

export default createStore({
  allowResend: true,
  allowSkip: true,
  maxlength: 6,
  otp: '',
});
