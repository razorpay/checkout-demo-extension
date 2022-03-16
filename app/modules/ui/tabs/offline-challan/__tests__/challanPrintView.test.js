import { render } from '@testing-library/svelte';
import Analytics from 'analytics';
import { getSDKMeta } from 'checkoutstore/native';
import { setupPreferences } from 'tests/setupPreferences';
import ChallanPrintView from '../ChallanPrintView.svelte';

const razorpayInstance = {
  id: 'id',
  key: 'rzp_test_key',
  customer_id: 'customer_id',
  get: (arg) => arg,
  getMode: () => 'test',
};

// Jest Mocks
jest.useFakeTimers();

jest.mock('sessionmanager', () => {
  return {
    getSession: () => ({
      get: jest.fn(),
      r: razorpayInstance,
      getPayload: jest.fn(),
      hideErrorMessage: jest.fn(),
      pdf_download_supported: true,
    }),
  };
});

jest.mock('common/Razorpay', () => {
  return {
    sendMessage: jest.fn(),
  };
});

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

global.fetch = {
  post: jest.fn((options) => {
    return new Promise((resolve) => {
      let response = {
        id: 'test_id',
        name: 'virtual accountss',
      };
      options.callback(response);
      resolve(response);
    });
  }),
};

function MockJSPDF() {
  this.save = jest.fn();
  this.output = jest.fn();
  this.setLineWidth = jest.fn();
  this.addImage = jest.fn();
  this.setFontSize = jest.fn();
  this.setFontType = jest.fn();
  this.text = jest.fn();
  this.rect = jest.fn();
  this.addPage = jest.fn();
  this.splitTextToSize = (arg) => [arg];
}

const waitForTime = (time) =>
  new Promise((resolve) => setTimeout(resolve, time));

let img;
let doc;
const challanDetails = {
  challan_number: '12312',
  bank_name: 'HDFC',
  name: 'NAME',
  client_code: 'CODE',
};

describe('Test Offline/index.svelte component', () => {
  beforeEach(() => {
    setupPreferences('internationalTests', razorpayInstance);
    Analytics.setR(razorpayInstance);
    img = new window.Image();
    doc = new MockJSPDF();
    img.onload = function () {};
    window.Image = function () {
      return img;
    };
    window.jsPDF = function () {
      return doc;
    };
  });

  it('should render without breaking', async () => {
    const spy = jest.spyOn(window, 'close').mockReturnValue(true);

    getSDKMeta.mockReturnValueOnce({
      platform: 'web',
    });
    const result = render(ChallanPrintView, {
      props: {
        challanDetails,
        expiry: 1000,
        amount: 100,
      },
    });
    img.onload();
    waitForTime(10).then(() => {
      expect(result).toBeTruthy();
      expect(doc.save).toBeCalledTimes(1);
      expect(spy).toBeCalled();
    });
  });

  it('Should download & save Challan on Android SDK', async () => {
    const spy = jest.spyOn(window, 'close').mockReturnValue(true);

    getSDKMeta.mockReturnValueOnce({
      platform: 'android',
    });
    const result = render(ChallanPrintView, {
      props: {
        challanDetails,
        expiry: 1000,
        amount: 100,
      },
    });
    img.onload();
    waitForTime(10).then(() => {
      expect(result).toBeTruthy();
      expect(doc.output).toBeCalledTimes(1);
      expect(spy).toBeCalled();
    });
  });

  it('Should download & save Challan on iOS SDK', async () => {
    const spy = jest.spyOn(window, 'close').mockReturnValue(true);

    getSDKMeta.mockReturnValueOnce({
      platform: 'ios',
    });
    const result = render(ChallanPrintView, {
      props: {
        challanDetails,
        expiry: 1000,
        amount: 100,
      },
    });
    img.onload();
    waitForTime(10).then(() => {
      expect(result).toBeTruthy();
      expect(doc.output).toBeCalledTimes(1);
      expect(spy).toBeCalled();
    });
  });
});
