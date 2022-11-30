import {
  getCommonBankName,
  getCorporateOption,
  getFullBankLogo,
  getRetailOption,
  hasMultipleOptions,
  isCorporateCode,
  BANK_TYPES,
  filterBanksAgainstInstrument,
  filterBanksByType,
  filterHiddenBanksUsingConfig,
} from 'common/bank';

const ALL_BANKS = {
  ICIC: 'ICICI Bank',
  ICIC_C: 'ICICI Bank - Corporate Banking',
  PUNB_R: 'Punjab National Bank - Retail Banking',
  LAVB_C: 'Lakshmi Vilas Bank - Corporate Banking',
  LAVB_R: 'Lakshmi Vilas Bank - Retail Banking',
  PHBM: 'Affin Bank',
  ARBK: 'AmBank',
  ARBK_C: 'AmBank',
  AGOB: 'AGRONet',
  AGOB_C: 'AGRONetBIZ',
  CITI: 'Citi Bank',
};

const RETAIL_BANKS = {
  ICIC: 'ICICI Bank',
  PUNB_R: 'Punjab National Bank - Retail Banking',
  LAVB_R: 'Lakshmi Vilas Bank - Retail Banking',
  PHBM: 'Affin Bank',
  ARBK: 'AmBank',
  AGOB: 'AGRONet',
  CITI: 'Citi Bank',
};

const CORPORATE_BANKS = {
  ICIC_C: 'ICICI Bank - Corporate Banking',
  LAVB_C: 'Lakshmi Vilas Bank - Corporate Banking',
  PHBM_C: 'AFFINMAX',
  ARBK_C: 'AmBank',
  AGOB_C: 'AGRONetBIZ',
};

describe('common/bank', () => {
  describe('#hasMultipleOptions', () => {
    it('It not has multipleOptions', () => {
      expect(hasMultipleOptions('PHBM', ALL_BANKS)).toBeFalsy();
    });

    it('It has multipleOptions', () => {
      expect(hasMultipleOptions('ICIC', ALL_BANKS)).toBeTruthy();
    });
  });

  describe('#isCorporateCode', () => {
    it('it is not a corporate code', () => {
      expect(isCorporateCode('PHBM')).toBe(false);
    });
    it('it is a corporate code', () => {
      expect(isCorporateCode('ICIC_C')).toBe(true);
    });
    it('it is a corporate code', () => {
      expect(isCorporateCode('PUNB_R')).toBe(false);
    });
  });

  describe('#getFullBankLogo', () => {
    it('it is not a corporate code', () => {
      expect(getFullBankLogo('PHBM')).toBe(
        'https://cdn.razorpay.com/bank-lg/PHBM.svg'
      );
    });
    it('it is a corporate code', () => {
      expect(getFullBankLogo('ICIC_C')).toBe(
        'https://cdn.razorpay.com/bank-lg/ICIC.svg'
      );
    });
    it('it is a corporate code', () => {
      expect(getFullBankLogo('PUNB_R')).toBe(
        'https://cdn.razorpay.com/bank-lg/PUNB.svg'
      );
    });
  });

  describe('#getCommonBankName', () => {
    it('SBI Bank', () => {
      expect(getCommonBankName('SBIN')).toBe('SBI');
    });
    it('VIJB Bank', () => {
      expect(getCommonBankName('VIJB')).toBe('Vijaya Bank');
    });
    it('HSBC Bank', () => {
      // @ts-ignore
      expect(getCommonBankName('HSBC')).toBe('HSBC');
    });
  });

  describe('#getRetailOption', () => {
    it('PHBM Bank has retail option ', () => {
      expect(getRetailOption('PHBM', ALL_BANKS)).toBe('PHBM');
    });
    it('ICIC Bank has retail option', () => {
      expect(getRetailOption('ICIC_C', ALL_BANKS)).toBe('ICIC');
    });

    it('PUNB Bank has retail option', () => {
      expect(getRetailOption('PUNB', ALL_BANKS)).toBe('PUNB_R');
    });
  });

  describe('#getCorporateOption', () => {
    it(`PHB Bank doesn't have corporate option`, () => {
      expect(getCorporateOption('PHBM', ALL_BANKS)).toBeFalsy();
    });
    it('ICIC Bank have corporate option', () => {
      expect(getCorporateOption('ICIC', ALL_BANKS)).toBe('ICIC_C');
    });

    it('PUNB Bank have corporate option', () => {
      expect(getCorporateOption('PUNB', ALL_BANKS)).toBeFalsy();
    });

    it('LAVB Bank have corporate option', () => {
      expect(getCorporateOption('LAVB_R', ALL_BANKS)).toBe('LAVB_C');
    });
  });

  describe('#filterBanksAgainstInstrument', () => {
    test('should return all bank list if no banks in instrument', () => {
      const instrument = {
        _ungrouped: [
          {
            _type: 'method',
            code: 'fpx',
            method: 'fpx',
          },
        ],
        _type: 'method',
        code: 'fpx',
        method: 'fpx',
        id: '56185641_rzp.cluster_0_2_fpx_false',
      };

      const banks = filterBanksAgainstInstrument(ALL_BANKS, instrument, 'fpx');
      expect(banks).toEqual(ALL_BANKS);
    });

    test('should return filtered list of banks matching banks in instrument', () => {
      const instrument = {
        _ungrouped: [
          {
            bank: 'CITI',
            method: 'fpx',
            _type: 'instrument',
          },
        ],
        banks: ['CITI'],
        method: 'fpx',
        _type: 'instrument',
        id: '56185641_block.banks_0_0_fpx_false',
      };

      const banks = filterBanksAgainstInstrument(ALL_BANKS, instrument, 'fpx');
      expect(banks).toEqual({ CITI: 'Citi Bank' });
    });

    test(`should return all bank list if instrument method doesn't match provided method`, () => {
      const instrument = {
        _ungrouped: [
          {
            _type: 'method',
            code: 'netbanking',
            method: 'netbanking',
          },
        ],
        _type: 'method',
        code: 'netbanking',
        method: 'netbanking',
        id: '56185641_rzp.cluster_0_2_netbanking_false',
      };

      const banks = filterBanksAgainstInstrument(ALL_BANKS, instrument, 'fpx');
      expect(banks).toEqual(ALL_BANKS);
    });

    test('instrument = null/undefined: should return all bank list as it is', () => {
      // @ts-ignore
      const banks1 = filterBanksAgainstInstrument(ALL_BANKS, null, 'fpx');
      // @ts-ignore
      const banks2 = filterBanksAgainstInstrument(ALL_BANKS, undefined, 'fpx');

      expect(banks1).toEqual(ALL_BANKS);
      expect(banks2).toEqual(ALL_BANKS);
    });
  });

  describe('#filterHiddenBanksUsingConfig', () => {
    test('should filter out hidden banks', () => {
      const hiddenBanks = Object.keys(ALL_BANKS).filter(
        (code) => code !== 'CITI'
      );
      const banks = filterHiddenBanksUsingConfig(ALL_BANKS, hiddenBanks);

      expect(banks).toEqual({ CITI: 'Citi Bank' });
    });

    test('hiddenBanks = []: should return bank list as it is', () => {
      const banks = filterHiddenBanksUsingConfig(ALL_BANKS, []);

      expect(banks).toEqual(ALL_BANKS);
    });

    test('hiddenBanks = null/undefined: should return bank list as it is', () => {
      // @ts-ignore
      const banks1 = filterHiddenBanksUsingConfig(ALL_BANKS, null);
      // @ts-ignore
      const banks2 = filterHiddenBanksUsingConfig(ALL_BANKS, undefined);

      expect(banks1).toEqual(ALL_BANKS);
      expect(banks2).toEqual(ALL_BANKS);
    });
  });

  describe('#filterBanksByType', () => {
    test('should return all retail banks on retail type', () => {
      const retailBanks = filterBanksByType(ALL_BANKS, BANK_TYPES.RETAIL);

      expect(retailBanks).toEqual(RETAIL_BANKS);
      expect(retailBanks).not.toEqual(CORPORATE_BANKS);
    });

    test('should return all retail banks on corporate type', () => {
      const corporateBankList = filterBanksByType(
        CORPORATE_BANKS,
        BANK_TYPES.CORPORATE
      );
      expect(corporateBankList).toEqual(CORPORATE_BANKS);
      expect(corporateBankList).not.toEqual(RETAIL_BANKS);
    });

    test('should return empty object in case no bank exist on given type', () => {
      const corporateBankList = filterBanksByType(
        RETAIL_BANKS,
        BANK_TYPES.CORPORATE
      );
      const retailBankList = filterBanksByType(
        CORPORATE_BANKS,
        BANK_TYPES.RETAIL
      );

      expect(retailBankList).toEqual({});
      expect(corporateBankList).toEqual({});
    });
  });
});
