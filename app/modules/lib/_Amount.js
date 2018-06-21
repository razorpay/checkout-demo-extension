export const getDecimalAmount = amount =>
  (amount / 100).toFixed(2).replace('.00', '');
