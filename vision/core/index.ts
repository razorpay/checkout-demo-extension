import { test as base } from '@playwright/test';
import { createRouter } from './router';
import makeUtil from './base';
import type { UtilType } from './types';

export const test = base.extend<{
  util: UtilType;
}>({
  util: async ({ page }, use) => {
    let context = {};
    const router = await createRouter(page, context);
    const util = makeUtil({ page, router }) as UtilType;
    util.router = router;
    util.updateContext = function (
      data: Parameters<UtilType['updateContext']>[0]
    ) {
      context = { ...router.getContext(), ...data };
      router.setContext(context);
    };
    util.getContext = router.getContext;
    util.setContext = router.setContext;
    util.getPopup = async (triggerPopup: () => Promise<void>) => {
      const popupPromise = page.waitForEvent('popup');
      await triggerPopup();
      const popup = await popupPromise;
      const router = await createRouter(popup, {});
      const handleResponse = async (options?: {
        success?: boolean;
        response?: Record<string, any>;
      }) => {
        const { success = true, response } = options || {};
        await popup.waitForSelector('.success');
        const defaultSuccess = {
          razorpay_payment_id: 'pay_GeiWKMc4BAbqc1',
        };
        const defaultFailure = {
          error: {
            code: 'BAD_REQUEST_ERROR',
            description: 'Payment processing cancelled by user',
            source: 'customer',
            step: 'payment_authentication',
            reason: 'payment_cancelled',
            metadata: { payment_id: 'pay_FdfZ3QnaBCid1G' },
          },
        };
        const responseData = response
          ? {}
          : success
          ? defaultSuccess
          : defaultFailure;

        await popup.evaluate(async (resp) => {
          try {
            window.opener.onComplete(resp);
          } catch (e) {}
          try {
            (window.opener || window.parent).postMessage(resp, '*');
          } catch (e) {}
          setTimeout(close, 999);
        }, responseData);
      };
      return { popup, router, handleResponse };
    };
    await use(util);
  },
});

// clear registered route after each test
test.afterEach(({ util }) => {
  util.router.clear();
});

export { expect } from '@playwright/test';
