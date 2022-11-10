export function* contact(state) {
  let prefsResponse = JSON.parse(
    state.history.find((entry) => entry.name === '/v1/preferences').response
      .body
  );
  const contactOptional = prefsResponse.optional?.includes('contact');

  if (!contactOptional) {
    yield '9999999999';
  }
}

export function* method() {
  yield true;
}

export function* email(state) {
  let prefsResponse = JSON.parse(
    state.history.find((entry) => entry.name === '/v1/preferences').response
      .body
  );
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
