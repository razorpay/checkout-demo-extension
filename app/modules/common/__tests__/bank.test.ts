import {
  getCommonBankName,
  getCorporateOption,
  getFullBankLogo,
  getRetailOption,
  hasMultipleOptions,
  isCorporateCode,
} from 'common/bank';

const bank = {
  ANDB: 'Andhra Bank',
  VIJB: 'Bank of Baroda - Retail Banking (Erstwhile Vijaya Bank)',
  HDFC_C: 'HDFC Bank - Corporate Banking',
  HSBC: 'HSBC',
  ICIC: 'ICICI Bank',
  ICIC_C: 'ICICI Bank - Corporate Banking',
  IBKL: 'IDBI',
  KKBK_C: 'Kotak Mahindra Bank - Corporate Banking',
  LAVB_C: 'Lakshmi Vilas Bank - Corporate Banking',
  LAVB_R: 'Lakshmi Vilas Bank - Retail Banking',
  NKGS: 'NKGSB Co-operative Bank',
  PSIB: 'Punjab & Sind Bank',
  PUNB_R: 'Punjab National Bank - Retail Banking',
  RATN: 'RBL Bank',
  SBHY: 'State Bank of Hyderabad',
  SBIN: 'State Bank of India',
  SBMY: 'State Bank of Mysore',
  YESB: 'Yes Bank',
};

describe('#hasMultipleOptions', () => {
  it('It not has multipleOptions', () => {
    expect(hasMultipleOptions('SBIN', bank)).toBeFalsy();
  });

  it('It not has multipleOptions', () => {
    expect(hasMultipleOptions('ICIC', bank)).toBeTruthy();
  });
});

describe('#isCorporateCode', () => {
  it('it is not a corporate code', () => {
    expect(isCorporateCode('SBIN')).toBe(false);
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
    expect(getFullBankLogo('SBIN')).toBe(
      'https://cdn.razorpay.com/bank-lg/SBIN.svg'
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
    expect(getCommonBankName('HSBC')).toBe('HSBC');
  });
});

describe('#getRetailOption', () => {
  it('SBI Bank dont have retail option ', () => {
    expect(getRetailOption('SBIN', bank)).toBe('SBIN');
  });
  it('ICIC Bank have retail option', () => {
    expect(getRetailOption('ICIC_C', bank)).toBe('ICIC');
  });

  it('PUNB Bank have retail option', () => {
    expect(getRetailOption('PUNB', bank)).toBe('PUNB_R');
  });
});

describe('#getCorporateOption', () => {
  it('SBI Bank dont have retail option ', () => {
    expect(getCorporateOption('SBIN', bank)).toBeFalsy();
  });
  it('ICIC Bank have retail option', () => {
    expect(getCorporateOption('ICIC', bank)).toBe('ICIC_C');
  });

  it('PUNB Bank have retail option', () => {
    expect(getCorporateOption('PUNB', bank)).toBeFalsy();
  });

  it('PUNB Bank have retail option', () => {
    expect(getCorporateOption('LAVB_R', bank)).toBe('LAVB_C');
  });
});
