export function getValue(element) {
  const { name } = element;

  switch (name) {
    case 'contact':
      return handlePhone();

    case 'email':
      return handleEmail();

    case 'vpa':
      return handleVpa();

    case 'first_name':
      return handleFirstName();

    case 'last_name':
      return handleLastName();

    case 'line1':
      return handleAddr1();

    case 'line2':
      return handleAddr2();

    case 'city':
      return handleCity();

    case 'postal_code':
      return handlePostalCode();
  }

  return emptyValue();
}

function* emptyValue() {
  yield {
    label: '',
    value: '',
  };
}

function* handlePhone(state) {
  yield {
    label: '',
    value: '9999999999',
  };
}

function* handleEmail(state) {
  yield {
    label: '',
    value: 'demo@demo.com',
  };
}

function* handleVpa(state) {
  yield {
    label: '',
    value: 'pro@upi',
  };
}
