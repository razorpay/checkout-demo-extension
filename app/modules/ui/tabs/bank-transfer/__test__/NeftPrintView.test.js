import { getMerchantKey, getOption, getOrderId } from 'razorpay';
import { render } from '@testing-library/svelte';
import {
  isCustomChallan,
  getCustomFields,
  getCustomDisclaimers,
  createChallanDetailTableData,
  addCustomFields,
} from '../helper';
import NeftPrintView from '../NeftPrintView.svelte';
import { getSDKMeta } from 'checkoutstore/native';
import { getCheckoutBridge, getNewIosBridge } from 'bridge';
import { getSession } from 'sessionmanager';
import { CHALLAN_FIELDS } from '../challanConstants';

jest.mock('razorpay', () => ({
  getOrderId: jest.fn(),
  getOption: jest.fn(),
  getMerchantKey: jest.fn(),
}));

jest.mock('sessionmanager', () => ({
  getSession: () => ({
    hideErrorMessage: jest.fn(),
    pdf_download_supported: true,
  }),
}));

jest.mock('../helper', () => ({
  isCustomChallan: jest.fn(),
  getCustomFields: jest.fn(),
  getCustomDisclaimers: jest.fn(),
  createChallanDetailTableData: jest.fn(),
  addCustomFields: jest.fn(),
}));

jest.mock('checkoutstore/native', () => ({
  getSDKMeta: jest.fn(),
}));

jest.mock('bridge', () => ({
  getCheckoutBridge: () => ({
    getPdfString: jest.fn(),
  }),
  getNewIosBridge: () => ({
    postMessage: jest.fn(),
  }),
}));
const neftDetails = {
  account_number: 7894561203,
  ifsc: 'MYBANK0123',
  branch: 'Bangalore',
  bank_name: 'MY BANK',
};
function MockJSPDF() {
  this.save = jest.fn();
  this.output = jest.fn();
  this.setLineWidth = jest.fn();
  this.addImage = jest.fn();
  this.setFontSize = jest.fn();
  this.line = jest.fn();
  this.setFontType = jest.fn();
  this.text = jest.fn();
  this.splitTextToSize = jest.fn();
}

beforeEach(() => {
  getOption
    .mockReturnValueOnce('Dummy description')
    .mockReturnValueOnce(false)
    .mockReturnValueOnce('Dummy Name');

  getOrderId.mockReturnValue('dummyOrderId');
});

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

    getSDKMeta.mockReturnValueOnce({
      platform: 'web',
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

    createChallanDetailTableData.mockImplementation(() => {
      return [
        {
          title: 'Beneficiary Name',
          id: CHALLAN_FIELDS.BENEFICIARY_NAME,
          value: 'Baaalamurugan',
        },
        {
          title: 'Virtual Account No',
          id: CHALLAN_FIELDS.ACCOUNT_NO,
          value: '1112221264829508',
        },
        {
          title: 'IFSC Code',
          id: CHALLAN_FIELDS.IFSC_CODE,
          value: 'RAZR0000001',
        },
        {
          title: 'Amount',
          id: CHALLAN_FIELDS.AMOUNT,
          value: '100',
        },
        {
          title: 'Customer Name',
          id: CHALLAN_FIELDS.CUSTOMER_NAME,
          value: 'Lorel Ipsum',
        },
        {
          title: 'Customer Email ID',
          id: CHALLAN_FIELDS.CUSTOMER_EMAIL,
          value: 'v@gmail.co',
        },
        {
          title: 'Customer Mobile No',
          id: CHALLAN_FIELDS.CUSTOMER_MOBILE,
          value: '7417688244',
        },
        {
          title: 'Razorpay Order ID',
          id: CHALLAN_FIELDS.ORDER_ID,
          value: 'order_JKksrJE9TdW1ya',
        },
      ];
    });

    addCustomFields.mockImplementation(() => {
      return [
        {
          title: 'Beneficiary Name',
          id: CHALLAN_FIELDS.BENEFICIARY_NAME,
          value: 'Baaalamurugan',
        },
        {
          title: 'Virtual Account No',
          id: CHALLAN_FIELDS.ACCOUNT_NO,
          value: '1112221264829508',
        },
        {
          title: 'IFSC Code',
          id: CHALLAN_FIELDS.IFSC_CODE,
          value: 'RAZR0000001',
        },
        {
          title: 'Amount',
          id: CHALLAN_FIELDS.AMOUNT,
          value: '100',
        },
        {
          title: 'Customer Name',
          id: CHALLAN_FIELDS.CUSTOMER_NAME,
          value: 'Lorem Ipsum',
        },
        {
          title: 'Customer Email ID',
          id: CHALLAN_FIELDS.CUSTOMER_EMAIL,
          value: 'v@gmail.co',
        },
        {
          title: 'Customer Mobile No',
          id: CHALLAN_FIELDS.CUSTOMER_MOBILE,
          value: '9999999999',
        },
        {
          title: 'Razorpay Order ID',
          id: CHALLAN_FIELDS.ORDER_ID,
          value: 'order_JKksrJE9TdW1ya',
        },
        {
          title: 'dummy id',
          value: 'dummy1234',
          id: 'dummy id',
        },
      ];
    });

    getSDKMeta.mockReturnValueOnce({
      platform: 'web',
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
describe('Generate Challan Customised by changing default field names', () => {
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

    isCustomChallan.mockReturnValue(true);
    getCustomFields.mockImplementation(() => {
      return [
        {
          title: 'Virtual Account Number',
          id: CHALLAN_FIELDS.ACCOUNT_NO,
        },
        {
          title: 'Valid Upto',
          id: CHALLAN_FIELDS.EXPIRY,
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

    createChallanDetailTableData.mockImplementation(() => {
      return [
        {
          title: 'Beneficiary Name',
          id: CHALLAN_FIELDS.BENEFICIARY_NAME,
          value: 'Baaalamurugan',
        },
        {
          title: 'Account No',
          id: CHALLAN_FIELDS.ACCOUNT_NO,
          value: '1112221264829508',
        },
        {
          title: 'IFSC Code',
          id: CHALLAN_FIELDS.IFSC_CODE,
          value: 'RAZR0000001',
        },
        {
          title: 'Amount',
          id: CHALLAN_FIELDS.AMOUNT,
          value: '100',
        },
        {
          title: 'Customer Name',
          id: CHALLAN_FIELDS.CUSTOMER_NAME,
          value: 'Lorel Ipsum',
        },
        {
          title: 'Customer Email ID',
          id: CHALLAN_FIELDS.CUSTOMER_EMAIL,
          value: 'v@gmail.co',
        },
        {
          title: 'Customer Mobile No',
          id: CHALLAN_FIELDS.CUSTOMER_MOBILE,
          value: '7417688244',
        },
        {
          title: 'Razorpay Order ID',
          id: CHALLAN_FIELDS.ORDER_ID,
          value: 'order_JKksrJE9TdW1ya',
        },
        {
          title: 'Expiry Date',
          id: CHALLAN_FIELDS.EXPIRY,
          value: '22 Dec 2022',
        },
      ];
    });

    addCustomFields.mockImplementation(() => {
      return [
        {
          title: 'Beneficiary Name',
          id: CHALLAN_FIELDS.BENEFICIARY_NAME,
          value: 'Baaalamurugan',
        },
        {
          title: 'Virtual Account No',
          id: CHALLAN_FIELDS.ACCOUNT_NO,
          value: '1112221264829508',
        },
        {
          title: 'IFSC Code',
          id: CHALLAN_FIELDS.IFSC_CODE,
          value: 'RAZR0000001',
        },
        {
          title: 'Amount',
          id: CHALLAN_FIELDS.AMOUNT,
          value: '100',
        },
        {
          title: 'Customer Name',
          id: CHALLAN_FIELDS.CUSTOMER_NAME,
          value: 'Lorem Ipsum',
        },
        {
          title: 'Customer Email ID',
          id: CHALLAN_FIELDS.CUSTOMER_EMAIL,
          value: 'v@gmail.co',
        },
        {
          title: 'Customer Mobile No',
          id: CHALLAN_FIELDS.CUSTOMER_MOBILE,
          value: '9999999999',
        },
        {
          title: 'Razorpay Order ID',
          id: CHALLAN_FIELDS.ORDER_ID,
          value: 'order_JKksrJE9TdW1ya',
        },
        {
          title: 'Valid Upto',
          id: CHALLAN_FIELDS.EXPIRY,
          value: '22 Dec 2022',
        },
      ];
    });

    getSDKMeta.mockReturnValueOnce({
      platform: 'web',
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

describe('Download & Save Challan on Android SDK', () => {
  test('Should be downloadable on android sdk', async () => {
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

    createChallanDetailTableData.mockImplementation(() => {
      return [
        {
          title: 'Beneficiary Name',
          id: CHALLAN_FIELDS.BENEFICIARY_NAME,
          value: 'Baaalamurugan',
        },
        {
          title: 'Virtual Account No',
          id: CHALLAN_FIELDS.ACCOUNT_NO,
          value: '1112221264829508',
        },
        {
          title: 'IFSC Code',
          id: CHALLAN_FIELDS.IFSC_CODE,
          value: 'RAZR0000001',
        },
        {
          title: 'Amount',
          id: CHALLAN_FIELDS.AMOUNT,
          value: '100',
        },
        {
          title: 'Customer Name',
          id: CHALLAN_FIELDS.CUSTOMER_NAME,
          value: 'Lorel Ipsum',
        },
        {
          title: 'Customer Email ID',
          id: CHALLAN_FIELDS.CUSTOMER_EMAIL,
          value: 'v@gmail.co',
        },
        {
          title: 'Customer Mobile No',
          id: CHALLAN_FIELDS.CUSTOMER_MOBILE,
          value: '7417688244',
        },
        {
          title: 'Razorpay Order ID',
          id: CHALLAN_FIELDS.ORDER_ID,
          value: 'order_JKksrJE9TdW1ya',
        },
      ];
    });

    addCustomFields.mockImplementation(() => {
      return [
        {
          title: 'Beneficiary Name',
          id: CHALLAN_FIELDS.BENEFICIARY_NAME,
          value: 'Baaalamurugan',
        },
        {
          title: 'Virtual Account No',
          id: CHALLAN_FIELDS.ACCOUNT_NO,
          value: '1112221264829508',
        },
        {
          title: 'IFSC Code',
          id: CHALLAN_FIELDS.IFSC_CODE,
          value: 'RAZR0000001',
        },
        {
          title: 'Amount',
          id: CHALLAN_FIELDS.AMOUNT,
          value: '100',
        },
        {
          title: 'Customer Name',
          id: CHALLAN_FIELDS.CUSTOMER_NAME,
          value: 'Lorem Ipsum',
        },
        {
          title: 'Customer Email ID',
          id: CHALLAN_FIELDS.CUSTOMER_EMAIL,
          value: 'v@gmail.co',
        },
        {
          title: 'Customer Mobile No',
          id: CHALLAN_FIELDS.CUSTOMER_MOBILE,
          value: '9999999999',
        },
        {
          title: 'Razorpay Order ID',
          id: CHALLAN_FIELDS.ORDER_ID,
          value: 'order_JKksrJE9TdW1ya',
        },
        {
          title: 'dummy id',
          value: 'dummy1234',
          id: 'dummy id',
        },
      ];
    });
    getSDKMeta.mockReturnValueOnce({
      platform: 'android',
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
    expect(doc.output).toBeCalledTimes(1);
    expect(spy).toBeCalled();
  });
});

describe('Download & Save Challan on IOS SDK', () => {
  test('Should be downloadable on ios sdk', async () => {
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

    createChallanDetailTableData.mockImplementation(() => {
      return [
        {
          title: 'Beneficiary Name',
          id: CHALLAN_FIELDS.BENEFICIARY_NAME,
          value: 'Baaalamurugan',
        },
        {
          title: 'Virtual Account No',
          id: CHALLAN_FIELDS.ACCOUNT_NO,
          value: '1112221264829508',
        },
        {
          title: 'IFSC Code',
          id: CHALLAN_FIELDS.IFSC_CODE,
          value: 'RAZR0000001',
        },
        {
          title: 'Amount',
          id: CHALLAN_FIELDS.AMOUNT,
          value: '100',
        },
        {
          title: 'Customer Name',
          id: CHALLAN_FIELDS.CUSTOMER_NAME,
          value: 'Lorem Ipsum',
        },
        {
          title: 'Customer Email ID',
          id: CHALLAN_FIELDS.CUSTOMER_EMAIL,
          value: 'v@gmail.co',
        },
        {
          title: 'Customer Mobile No',
          id: CHALLAN_FIELDS.CUSTOMER_MOBILE,
          value: '9999999999',
        },
        {
          title: 'Razorpay Order ID',
          id: CHALLAN_FIELDS.ORDER_ID,
          value: 'order_JKksrJE9TdW1ya',
        },
      ];
    });

    addCustomFields.mockImplementation(() => {
      return [
        {
          title: 'Beneficiary Name',
          id: CHALLAN_FIELDS.BENEFICIARY_NAME,
          value: 'Baaalamurugan',
        },
        {
          title: 'Virtual Account No',
          id: CHALLAN_FIELDS.ACCOUNT_NO,
          value: '1112221264829508',
        },
        {
          title: 'IFSC Code',
          id: CHALLAN_FIELDS.IFSC_CODE,
          value: 'RAZR0000001',
        },
        {
          title: 'Amount',
          id: CHALLAN_FIELDS.AMOUNT,
          value: '100',
        },
        {
          title: 'Customer Name',
          id: CHALLAN_FIELDS.CUSTOMER_NAME,
          value: 'Lorem Ipsum',
        },
        {
          title: 'Customer Email ID',
          id: CHALLAN_FIELDS.CUSTOMER_EMAIL,
          value: 'v@gmail.co',
        },
        {
          title: 'Customer Mobile No',
          id: CHALLAN_FIELDS.CUSTOMER_MOBILE,
          value: '9999999999',
        },
        {
          title: 'Razorpay Order ID',
          id: CHALLAN_FIELDS.ORDER_ID,
          value: 'order_JKksrJE9TdW1ya',
        },
        {
          title: 'dummy id',
          value: 'dummy1234',
          id: 'dummy id',
        },
      ];
    });

    getSDKMeta.mockReturnValueOnce({
      platform: 'ios',
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
    expect(doc.output).toBeCalledTimes(1);
    expect(spy).toBeCalled();
  });
});
