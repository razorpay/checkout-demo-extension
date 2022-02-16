import { getMerchantKey, getOption } from 'razorpay';
import { render } from '@testing-library/svelte';
import {
  isCustomChallan,
  getCustomFields,
  getCustomDisclaimers,
} from '../helper';

import NeftPrintView from '../NeftPrintView.svelte';
jest.mock('razorpay', () => ({
  getOption: jest.fn(),
  getMerchantKey: jest.fn(),
}));
jest.mock('sessionmanager', () => ({
  getSession: () => ({
    hideErrorMessage: jest.fn(),
  }),
}));
jest.mock('../helper', () => ({
  isCustomChallan: jest.fn(),
  getCustomFields: jest.fn(),
  getCustomDisclaimers: jest.fn(),
}));
const neftDetails = {
  account_number: 7894561203,
  ifsc: 'MYBANK0123',
  branch: 'Bangalore',
  bank_name: 'MY BANK',
};
function MockJSPDF() {
  this.save = jest.fn();
  this.setLineWidth = jest.fn();
  this.addImage = jest.fn();
  this.setFontSize = jest.fn();
  this.line = jest.fn();
  this.setFontType = jest.fn();
  this.text = jest.fn();
  this.splitTextToSize = jest.fn();
}

describe('Generate Challan Standard', () => {
  test('Should be generated', async () => {
    let img = new window.Image();
    let doc = new MockJSPDF();
    img.onload = function () {};

    window.Image = function () {
      return img;
    };
    window.jsPDF = function () {
      return doc;
    };

    const spy = jest.spyOn(window, 'close').mockReturnValue(true);

    getOption
      .mockReturnValueOnce('Dummy description')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce('dummyOrderId')
      .mockReturnValueOnce('Dummy Name');
    const result = render(NeftPrintView, {
      props: {
        neftDetails: neftDetails,
        expiry: 1644469342,
        amount: 10000,
      },
    });
    img.onload();
    expect(result).toBeTruthy();
    expect(doc.save).toBeCalledTimes(1);
    expect(spy).toBeCalled();
  });
});

describe('Generate Challan Customised', () => {
  test('Should be generated', async () => {
    let img = new window.Image();
    let doc = new MockJSPDF();
    img.onload = function () {};

    window.Image = function () {
      return img;
    };
    window.jsPDF = function () {
      return doc;
    };

    const spy = jest.spyOn(window, 'close').mockReturnValue(true);

    getOption
      .mockReturnValueOnce('Dummy description')
      .mockReturnValueOnce(false)
      .mockReturnValueOnce('dummyOrderId')
      .mockReturnValueOnce('Dummy Name');
    isCustomChallan.mockReturnValue(true);
    getCustomFields.mockImplementation(() => {
      return [
        {
          title: 'dummy id',
          value: 'dummy1234',
        },
      ];
    });
    getCustomDisclaimers.mockImplementation(() => {
      return [
        {
          text: 'Dummy disclaimer',
        },
      ];
    });
    const result = render(NeftPrintView, {
      props: {
        neftDetails: neftDetails,
        expiry: 1644469342,
        amount: 10000,
      },
    });
    img.onload();
    expect(result).toBeTruthy();
    expect(isCustomChallan).toBeCalledTimes(2);
    expect(doc.save).toBeCalledTimes(1);
    expect(spy).toBeCalled();
  });
});
