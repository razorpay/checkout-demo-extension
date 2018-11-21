const networks = {
  amex: 'American Express',
  diners: 'Diners Club',
  maestro: 'Maestro',
  mastercard: 'MasterCard',
  rupay: 'RuPay',
  visa: 'Visa',
  unknown: 'unknown',
};

/**
 * @param {String} name {eg: MasterCard}
 *
 * @return {String} {eg: mastercard}
 */
export const findCodeByNetworkName = name => {
  let code;

  _Obj.loop(networks, (val, key) => {
    if (name === val) {
      code = key;
    }
  });

  return code;
};

/**
 * @param {String} code {eg: mastercard}
 *
 * @return {String} {eg: MasterCard}
 */
export const findNetworkNameByCode = code => {
  return networks[code];
};
