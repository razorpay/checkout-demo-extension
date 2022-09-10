const sliceAndLower = (str = '', len = 4) =>
  str.slice(0, len).toLocaleLowerCase();
/**
 * @param {str} ifsc
 * @param {str} bankCode
 * @returns boolean
 * On emandate method while entering bank account number
 * and IFSC code this function will check if entered bank
 * IFSC code is of chosen bank by comparing IFSC first 4 chars
 * with Banks codes first 4 chars
 */
export const isValidIFSC = (ifsc: string, bankCode: string): boolean => {
  ifsc = sliceAndLower(ifsc);
  bankCode = sliceAndLower(bankCode);
  if (bankCode === ifsc) {
    return false;
  }
  return true;
};
