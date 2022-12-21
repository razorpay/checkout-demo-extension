import { test as base } from '@playwright/test';
import { createRouter } from './router';
import makeUtil from './base';
import type { Context } from './types';

const isProd = process.env.NODE_ENV === 'production';

type ReturnTypeOfPromise<T> = T extends Promise<infer I> ? I : T;

export type RouterType = ReturnTypeOfPromise<ReturnType<typeof createRouter>>;

type UtilType = ReturnType<typeof makeUtil> & {
  matchScreenshot: (name: string) => Promise<void>;
  router: RouterType;
  updateContext: (data: Context) => void;
  setContext: (data: Context) => void;
};

export const test = base.extend<{
  util: UtilType;
}>({
  util: async ({ page }, use) => {
    let context = {};
    const router = await createRouter(page, context);
    const util = makeUtil(page) as UtilType;
    util.matchScreenshot = async (name: string) => {
      if (isProd) {
        expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(
          `${name}.png`
        );
      }
    };
    util.router = router;
    util.updateContext = function (
      data: Parameters<UtilType['updateContext']>[0]
    ) {
      context = { ...context, ...data };
      router.setContext(context);
    };
    util.setContext = router.setContext;
    await use(util);
  },
});

// clear registered route after each test
test.afterEach(({ util }) => {
  util.router.clear();
});

export { expect } from '@playwright/test';
