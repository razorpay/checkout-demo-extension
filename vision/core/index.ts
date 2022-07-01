import { test as base } from '@playwright/test';
import { createRouter } from './router';
import makeUtil from './base';

const isProd = process.env.NODE_ENV === 'production';

type ReturnTypeOfPromise<T> = T extends Promise<infer I> ? I : T;

export type RouterType = ReturnTypeOfPromise<ReturnType<typeof createRouter>>;

type UtilType = ReturnType<typeof makeUtil> & {
  matchScreenshot: (name: string) => Promise<void>;
  router: RouterType;
};

export const test = base.extend<{
  util: UtilType;
}>({
  util: async ({ page }, use) => {
    const router = await createRouter(page);
    const util = makeUtil(page);
    (util as UtilType).matchScreenshot = async (name: string) => {
      if (isProd) {
        expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(
          `${name}.png`
        );
      }
    };
    (util as UtilType).router = router;
    await use(util as UtilType);
  },
});

// clear registered route after each test
test.afterEach(({ util }) => {
  util.router.clear();
});

export { expect } from '@playwright/test';
