export function* contact({ selectResponse }) {
  const prefsResponse = selectResponse('preferences');
  const contactOptional = prefsResponse.optional?.includes('contact');

  if (!contactOptional) {
    yield '9999999999';
  }
}

export function* method() {
  yield true;
}

export function* email({ selectResponse }) {
  const prefsResponse = selectResponse('preferences');
  const emailOptional = prefsResponse.optional?.includes('email');

  if (!emailOptional) {
    yield 'demo@demo.com';
  }
}

export function* vpa() {
  yield 'pro@upi';
}

export function* cta() {
  yield true;
}

export function* bank() {
  yield true;
}

export function* upiAction() {
  yield true;
}

export function* wallet() {
  yield true;
}

export function* provider() {
  yield true;
}

export function* cardNumber() {
  yield '4111111111111111';
}

export function* cardName() {
  yield 'Gaurav Kumar';
}

export function* cardExpiry() {
  yield '1234';
}

export function* cardCvv() {
  yield '123';
}

export function* otp() {
  yield '123456';
}

export function* otpDigit1() {
  yield '1';
}

export function* otpDigit2() {
  yield '1';
}

export function* otpDigit3() {
  yield '1';
}

export function* otpDigit4() {
  yield '1';
}

export function* otpDigit5() {
  yield '1';
}

export function* otpDigit6() {
  yield '1';
}
