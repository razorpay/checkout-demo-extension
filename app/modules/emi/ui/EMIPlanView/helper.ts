/** helper related to EMIPlanView */

/** constant */
const banksWithDebitEmi = ['HDFC'];
const bankOverrides: Partial<EMIPlanView.EMIPlanData> = {
  SBIN: {
    code: 'SBIN',
    name: 'SBI Credit Card',
  },
};

/**
 * Adds overrides to banks.
 * @param {Object} allBanks Object containting key-value pairs of banks.
 *
 * @return {Object}
 */
export function useBankOverrides(allBanks: EMIPlanView.EMIPlanData) {
  const banks = _Obj.clone(allBanks);

  _Obj.loop(bankOverrides, (_: any, code: string) => {
    if (banks[code]) {
      banks[code] = _Obj.extend(banks[code], bankOverrides[code]);
    }
  });
  return banks;
}

export function filterBanksAgainstInstrument(
  banks: EMIPlanView.EMIPlan[],
  instrument: null | { method?: string; issuers?: string[] }
) {
  // Absence of issuers means that it is a method instrument for EMI.
  // We do not need to filter in that case.
  if (!instrument || instrument.method !== 'emi' || !instrument.issuers) {
    return banks;
  }

  const debitEmiinclusiveIssuers = instrument.issuers.reduce(
    (pV: string[], bankCode) => {
      if (banksWithDebitEmi.includes(bankCode)) {
        pV.push(`${bankCode}_DC`);
      }
      pV.push(bankCode);
      return pV;
    },
    []
  );

  return banks.filter((bank: EMIPlanView.EMIPlan) =>
    debitEmiinclusiveIssuers.includes(bank.code)
  );
}
