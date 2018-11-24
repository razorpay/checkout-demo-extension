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
  const { tokens = [] } = getCustomerData();

  let token = _Arr.find(tokens, token => token.id === tokenId);

  if (token) {
    _Obj.loop(data, (val, key) => _Obj.setProp(token, key, val));
  }

  return token;
};
