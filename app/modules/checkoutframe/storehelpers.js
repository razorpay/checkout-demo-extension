import Store from 'checkoutframe/store';

/**
 * Set data for the customer.
 * @param {Object} props
 *
 * @return {Object} Customer
 */
export const setCustomerData = props => {
  let { Customer } = Store.get();

  Customer = _Obj.extend(Customer, props);

  Store.set({
    Customer,
  });

  return Customer;
};

export const getCustomerData = () => Store.get().Customer;

/**
 * Add data to a given token.
 *
 * @param {String} tokenId
 * @param {Object} data
 *
 * @return {Object} Token
 */
export const addTokenData = (tokenId, data) => {
  const { tokens } = getCustomerData();

  if (!tokens) {
    return;
  }

  let token = _Arr.find(tokens, token => token.id === tokenId);

  if (!token) {
    return;
  }

  if (token) {
    _Obj.extend(token, data);
  }

  const Customer = getCustomerData();
  Customer.tokens = tokens;
  Store.set({
    Customer,
  });

  return token;
};

export const getScreenData = screen => Store.get().screenData[screen];

export const setScreenData = (screen, data) => {
  const { screenData } = Store.get();

  screenData[screen] = _Obj.extend(screenData[screen], data);

  Store.set({
    screenData,
  });

  return screenData[screen];
};
