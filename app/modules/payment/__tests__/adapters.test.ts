import {
  checkPaymentAdapter,
  gpayPaymentRequestAdapter,
  credPaymentRequestAdapter,
  phonepePaymentRequestAdapter,
  isBrowserAllowedByGpay,
} from 'payment/adapters';
import * as constants from 'common/useragent';
import { CHECK_ERROR, NO_PAYMENT_ADAPTER_ERROR } from 'common/constants';

const adapters = [
  ['Cred', 'cred', credPaymentRequestAdapter],
  ['Phonepe', 'com.phonepe.app', phonepePaymentRequestAdapter],
  [
    'Google Pay',
    'com.google.android.apps.nbu.paisa.user',
    gpayPaymentRequestAdapter,
  ],
];

describe('Test adapters when PaymentRequest API exists', () => {
  beforeEach(() => {
    jest.mock('payment/adapters', () => ({
      ...jest.requireActual('payment/adapters'),
      __esModule: true,
      isBrowserAllowedByGpay: Promise.resolve(true),
    }));

    class PaymentRequestMock {
      canMakePayment() {
        return Promise.resolve(true);
      }
    }
    window.PaymentRequest =
      PaymentRequestMock as unknown as typeof window.PaymentRequest;

    (constants as any).android = true;
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  test.each(adapters)(
    'should resolve %s adapter',
    async (_, packageName, adapter) => {
      await expect(checkPaymentAdapter(packageName as string)).resolves.toBe(
        undefined
      );
      await expect((adapter as any)()).resolves.toBe(undefined);
    }
  );
});
describe('Test adapters when the UPI Apps are not exists', () => {
  beforeEach(() => {
    class PaymentRequestMock {
      canMakePayment() {
        return Promise.resolve(false);
      }
    }
    window.PaymentRequest =
      PaymentRequestMock as unknown as typeof window.PaymentRequest;

    (constants as any).android = true;
  });
  test.each(adapters)(
    'should reject %s adapter',
    async (_, packageName, adapter) => {
      await expect(checkPaymentAdapter(packageName as string)).rejects.toBe(
        CHECK_ERROR
      );
      await expect((adapter as any)()).rejects.toBe(CHECK_ERROR);
    }
  );
});
describe('Test adapters when canMakePayment not exist', () => {
  beforeEach(() => {
    class PaymentRequestMock {
      canMakePayment() {
        return Promise.reject();
      }
    }
    window.PaymentRequest =
      PaymentRequestMock as unknown as typeof window.PaymentRequest;
  });
  test.each(adapters)(
    'should reject %s adapter',
    async (_, packageName, adapter) => {
      await expect(checkPaymentAdapter(packageName as string)).rejects.toBe(
        CHECK_ERROR
      );
      await expect((adapter as any)()).rejects.toBe(CHECK_ERROR);
    }
  );
});
describe('Test adapters when PaymentRequest API not exists', () => {
  beforeEach(() => {
    delete (window as any).PaymentRequest;
  });
  test.each(adapters)(
    'should reject %s adapter',
    async (_, packageName, adapter) => {
      await expect((adapter as any)()).rejects.toBe(CHECK_ERROR);
    }
  );
});
describe('Test checkPaymentAdapter', () => {
  test('Test checkPaymentAdapter when PackageName not exists', async () => {
    await expect(checkPaymentAdapter('Test Pay')).rejects.toMatchObject({
      description: NO_PAYMENT_ADAPTER_ERROR,
    });
  });
  test('should not support on desktop', async () => {
    (constants as any).android = false;
    (constants as any).iOS = false;
    (constants as any).isDesktop = () => Promise.resolve(true);
    await expect(checkPaymentAdapter('com.phonepe.app')).rejects.toMatchObject({
      description: NO_PAYMENT_ADAPTER_ERROR,
    });
  });
});
describe('Test isBrowserAllowedByGpay', () => {
  test('Test isBrowserAllowedByGpay when Samsung Browser is presented', async () => {
    (constants as any).samsungBrowser = true;
    await expect(isBrowserAllowedByGpay()).rejects.toBe(undefined);
  });
  test('Test isBrowserAllowedByGpay when Brave Browser is presented', async () => {
    (constants as any).samsungBrowser = false;
    (constants as any).isBraveBrowser = () => Promise.resolve(true);
    await expect(isBrowserAllowedByGpay()).rejects.toBe(undefined);
  });
});
describe('Test gpayPaymentRequestAdapter', () => {
  beforeEach(() => {
    class PaymentRequestMock {
      canMakePayment() {
        return Promise.resolve(true);
      }
    }
    window.PaymentRequest =
      PaymentRequestMock as unknown as typeof window.PaymentRequest;
  });
  test('Test gpayPaymentRequestAdapter when Brave Browser is presented', async () => {
    await expect(gpayPaymentRequestAdapter()).rejects.toBe(CHECK_ERROR);
  });
});
