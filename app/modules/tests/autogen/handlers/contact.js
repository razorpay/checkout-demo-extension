import { getPreferences } from 'razorpay';

export function* handlePhone() {
  if (getPreferences('mode') === 'test') {
    yield '8888888888';
  }

  yield '9999999999';
}

export function* handleEmail() {
  yield 'demo@demo.com';
}
