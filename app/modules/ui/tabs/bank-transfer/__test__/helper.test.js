import { getOption } from 'razorpay';
import {
  isCustomChallan,
  getCustomDisclaimers,
  getCustomFields,
  getCustomExpiry,
  getTimeStamp,
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

describe('#getCustomFields', () => {
  const data = [
    {
      title: 'Dummy id',
      value: 'dummy1234',
    },
  ];
  test('feilds', () => {
    getOption.mockReturnValueOnce(data);
    let feilds = getCustomFields();
    expect(feilds).toHaveLength(1);
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
    expect(value).toEqual(Math.floor(minTime / 1000));
  });
  test('when given more than maxTime ', () => {
    let value = getTimeStamp(moreThanMaxTime);
    expect(value).toEqual(Math.floor(maxTime / 1000));
  });
  test('when given more than minTime and less than maxTime', () => {
    let value = getTimeStamp(inRange);
    expect(value).toEqual(Math.floor(inRange / 1000));
  });
});
