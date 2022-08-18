import { getOption } from 'razorpay';
import { CHALLAN_FIELDS, labels } from '../challanConstants';
import {
  isCustomChallan,
  getCustomDisclaimers,
  getCustomFields,
  getCustomExpiry,
  getTimeStamp,
  addCustomFields,
  createChallanDetailTableData,
} from '../helper';

jest.mock('razorpay', () => ({
  getOption: jest.fn(),
}));

describe('#isCustomChallan', () => {
  it('should return true', () => {
    getOption.mockReturnValue([{ text: 'dummy' }]);
    const value = isCustomChallan('challan.disclaimers');
    expect(value).toBeTruthy();
  });

  it('should return false', () => {
    getOption.mockReturnValueOnce(false);
    const value = isCustomChallan('challan.disclaimers');
    expect(value).not.toBeTruthy();
  });
});

describe('#getCustomDisclaimers', () => {
  const data = [
    {
      text: 'Dummy disclaimer 1',
    },
    { text: 'Dummy disclaimer 2' },
  ];
  test('disclaimers', () => {
    getOption.mockReturnValueOnce(data);
    let disclaimers = getCustomDisclaimers();
    expect(disclaimers).toHaveLength(2);
    getOption.mockReturnValueOnce(undefined);
    expect(getCustomDisclaimers()).toHaveLength(0);
  });
});

describe('#getCustomDisclaimers setPadding check', () => {
  const data = [
    {
      text: 'Dummy disclaimer 1',
    },
  ];
  test('disclaimers', () => {
    getOption.mockReturnValueOnce(data);
    let disclaimers = getCustomDisclaimers();
    expect(disclaimers).toHaveLength(1);
    expect(disclaimers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: 'Dummy disclaimer 1' }),
        expect.objectContaining({ padding: 4 }),
      ])
    );

    getOption.mockReturnValueOnce(undefined);
    expect(getCustomDisclaimers()).toHaveLength(0);
  });
});

describe('#getCustomFields', () => {
  const data = [
    {
      title: 'Dummy id',
      value: 'dummy1234',
    },
  ];
  test('fields', () => {
    getOption.mockReturnValueOnce(data);
    let fields = getCustomFields();
    expect(fields).toHaveLength(1);
    getOption.mockReturnValueOnce(undefined);
    expect(getCustomFields()).toHaveLength(0);
  });
});

describe('#getCustomExpiry', () => {
  const expiry = { date: 1644469342000 };
  test('expiry', () => {
    getOption.mockReturnValueOnce(expiry);
    let timeStamp = getCustomExpiry();
    expect(timeStamp).toBe(expiry.date);
  });
});

describe('#getTimeStamp', () => {
  const lessThanMin = new Date().getTime() + 13 * 60000;
  const moreThanMaxTime = new Date().setMonth(new Date().getMonth() + 7);
  const minTime = new Date().getTime() + 20 * 60000;
  const maxTime = new Date().setMonth(new Date().getMonth() + 6);
  const inRange = new Date().setMonth(new Date().getMonth() + 2);

  test('when given less than minTime', () => {
    let value = getTimeStamp(lessThanMin);
    expect(value).toBeGreaterThanOrEqual(Math.floor(minTime / 1000));
  });
  test('when given more than maxTime ', () => {
    let value = getTimeStamp(moreThanMaxTime);
    expect(value).toBeGreaterThanOrEqual(Math.floor(maxTime / 1000));
  });
  test('when given more than minTime and less than maxTime', () => {
    let value = getTimeStamp(inRange);
    expect(value).toEqual(Math.floor(inRange / 1000));
  });
});

describe('#addCustomFields', () => {
  const customFields = [
    {
      title: 'Internal Prod ID',
      value: '123456',
    },
    {
      title: 'Virtual Account No',
      id: 'account_no',
    },
    {
      title: 'Valid Upto',
      id: 'expiry',
    },
  ];
  const data = [
    {
      title: 'Account No.',
      id: CHALLAN_FIELDS.ACCOUNT_NO,
      value: '1112221264829508',
    },

    {
      title: 'Amount',
      id: CHALLAN_FIELDS.AMOUNT,
      value: '100',
    },

    {
      title: 'Expiry Date',
      id: CHALLAN_FIELDS.EXPIRY,
      value: '27th Jul, 2022',
    },
  ];
  test('fields', () => {
    getOption.mockReturnValueOnce(customFields);

    const finalData = addCustomFields(data);
    expect(finalData).toHaveLength(4);
    expect(finalData).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({ title: 'Expiry Date' }),
      ])
    );
    expect(finalData).toEqual(
      expect.arrayContaining([expect.objectContaining({ title: 'Valid Upto' })])
    );
    expect(finalData).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({ title: 'Account No.' }),
      ])
    );
    expect(finalData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Internal Prod ID' }),
      ])
    );
  });
});

describe('#addCustomFields without value and id', () => {
  const customFields = [
    {
      title: 'Internal Prod ID',
      value: '123456',
    },
    {
      title: 'Internal Account No',
    },
  ];
  const data = [
    {
      title: 'Account No.',
      id: CHALLAN_FIELDS.ACCOUNT_NO,
      value: '1112221264829508',
    },
    {
      title: 'Expiry Date',
      id: CHALLAN_FIELDS.EXPIRY,
      value: '27th Jul, 2022',
    },
  ];
  test('negative case of not adding value in custom field', () => {
    getOption.mockReturnValueOnce(customFields);

    const finalData = addCustomFields(data);
    expect(finalData).toHaveLength(3);
    expect(finalData).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({ title: 'Internal Account No' }),
      ])
    );
  });
});

describe('Custom Fields without value and id that does not exit predefined', () => {
  const customFields = [
    {
      title: 'Internal Prod ID',
      value: '123456',
    },
    {
      title: 'Valid Upto',
      id: 'expiry_date',
    },
  ];
  const data = [
    {
      title: 'Account No.',
      id: CHALLAN_FIELDS.ACCOUNT_NO,
      value: '1112221264829508',
    },
    {
      title: 'Expiry Date',
      id: CHALLAN_FIELDS.EXPIRY,
      value: '27th Jul, 2022',
    },
  ];
  test('negative case of not adding value with wrong id', () => {
    getOption.mockReturnValueOnce(customFields);
    const finalData = addCustomFields(data);
    expect(finalData).toHaveLength(3);
    expect(finalData).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({ title: 'Valid Upt' }),
      ])
    );
  });
});

describe('#createChallanDetailTableData', () => {
  const data = {
    [CHALLAN_FIELDS.BENEFICIARY_NAME]: 'Lorem Ipsum',
    [CHALLAN_FIELDS.ACCOUNT_NO]: '123456789',
    [CHALLAN_FIELDS.IFSC_CODE]: 'RZA00001',
    [CHALLAN_FIELDS.BANK]: 'Razorpay Bank',
  };
  test('only those values in final result which have value available in data', () => {
    const finalData = createChallanDetailTableData(labels.ROW_HEADERS, data);
    expect(finalData).toHaveLength(4);
    expect(finalData).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: 'Beneficiary Name' }),
        expect.objectContaining({ value: 'Lorem Ipsum' }),
      ])
    );
  });
});
