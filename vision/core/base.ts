import path from 'path';
import { readFile } from 'fs/promises';
import { Page } from '@playwright/test';
import { checkoutPublic } from '../constant';
import type { RouterType, UtilFunction } from './types';
import * as helperFunctions from '../utils';
import Options from '../mock/options';

type getUserInputType<fx extends UtilFunction> = Parameters<fx>[0]['inputData'];

type UtilMethods = {
  [x in keyof typeof helperFunctions]: ReturnType<
    // @ts-ignore
    typeof bindUtilFunction<getUserInputType<typeof helperFunctions[x]>>
  >;
};

function bindUtilFunction<T = unknown>(
  fx: UtilFunction,
  router: RouterType,
  page: Page
) {
  return (inputData?: T) => {
    const context = router.getContext();
    return fx({
      context,
      inputData,
      router,
      page,
    });
  };
}

export default function makeUtil({
  page,
  router,
}: {
  page: Page;
  router: RouterType;
}) {
  const utilMethods: UtilMethods = Object.keys(helperFunctions).reduce(
    (utils, key) => {
      const fx = helperFunctions[key];
      utils[key] = bindUtilFunction<getUserInputType<typeof fx>>(
        fx,
        router,
        page
      );
      return utils;
    },
    {} as UtilMethods
  );
  return {
    prepareOptions: Options,
    async openCheckout(param?: { options?: Parameters<typeof Options>[0] }) {
      const { options = Options() } = param || {};
      const body = await getHostIndex();
      await page.route(
        checkoutPublic,
        (route) => {
          route.fulfill({
            status: 200,
            body,
          });
        },
        {
          times: 1,
        }
      );
      await page.goto(checkoutPublic);
      const context = router.getContext() || {};
      router.setContext({ ...(context || {}), options });
      passMessage(page, { options });
    },
    ...utilMethods,
  };
}
function getHostIndex() {
  return readFile(path.join(__dirname, '../mock/index.html'));
}

async function passMessage(page, message) {
  await page.evaluate(
    (message) => (window as any).handleMessage(message),
    message
  );
}
