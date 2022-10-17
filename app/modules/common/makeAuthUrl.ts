import { makeAuthUrl as _makeAuthUrl } from 'common/helper';
import RazorpayStore from 'razorpay';

export const makeAuthUrl = (url: string) =>
  _makeAuthUrl(RazorpayStore.get(), url);
